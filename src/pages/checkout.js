import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { FiCreditCard, FiLock, FiCheck, FiTruck } from 'react-icons/fi';
import Layout from '../components/Layout';
import Toast from '../components/Toast';
import { createOrder } from '../lib/api';

const CheckoutPage = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    
    // Payment Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    
    // Payment Method
    paymentMethod: 'cod', // 'cod' only
    
    // Billing same as shipping
    billingIsSame: true
  });

  const [formErrors, setFormErrors] = useState({});
  const [cardType, setCardType] = useState('');
  const [phoneCountry, setPhoneCountry] = useState('');
  
  // FIXED: Add toast notification state for better UX
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let formattedValue = value;

    // Format specific fields
    if (name === 'cardNumber') {
      // Remove all non-digits and format as XXXX XXXX XXXX XXXX
      formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    } else if (name === 'expiryDate') {
      // Format as MM/YY
      formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
    } else if (name === 'cvv') {
      // Only allow 3-4 digits
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (name === 'phone') {
      // Format phone number with special handling for Pakistani numbers
      const digits = value.replace(/\D/g, '');
      
      // Check if it's a Pakistani number
      if (digits.startsWith('92') || digits.startsWith('03') || (digits.startsWith('3') && digits.length <= 10)) {
        // Pakistani format: 03XX-XXXXXXX or +92-3XX-XXXXXXX
        if (digits.startsWith('92')) {
          // International Pakistani format: +92-3XX-XXXXXXX (max 12 digits)
          const limitedDigits = digits.slice(0, 12); // Limit to 12 digits (92 + 10 digits)
          if (limitedDigits.length <= 5) {
            formattedValue = '+92-' + limitedDigits.slice(2);
          } else if (limitedDigits.length <= 8) {
            formattedValue = '+92-' + limitedDigits.slice(2, 5) + '-' + limitedDigits.slice(5);
          } else {
            formattedValue = '+92-' + limitedDigits.slice(2, 5) + '-' + limitedDigits.slice(5, 12);
          }
        } else if (digits.startsWith('03')) {
          // Local Pakistani format: 03XX-XXXXXXX (max 11 digits)
          const limitedDigits = digits.slice(0, 11); // Limit to exactly 11 digits
          if (limitedDigits.length <= 4) {
            formattedValue = limitedDigits;
          } else {
            formattedValue = limitedDigits.slice(0, 4) + '-' + limitedDigits.slice(4, 11);
          }
        } else if (digits.startsWith('3')) {
          // Pakistani without leading 0: 3XX-XXXXXXX (max 10 digits)
          const limitedDigits = digits.slice(0, 10); // Limit to exactly 10 digits
          if (limitedDigits.length <= 3) {
            formattedValue = limitedDigits;
          } else {
            formattedValue = limitedDigits.slice(0, 3) + '-' + limitedDigits.slice(3, 10);
          }
        } else {
          formattedValue = digits;
        }
      } else {
        // International format for other countries
        if (value.startsWith('+') || digits.length > 10) {
          // International format: +XX-XXX-XXX-XXXX
          if (digits.length === 0) {
            formattedValue = '';
          } else if (digits.length <= 3) {
            formattedValue = '+' + digits;
          } else if (digits.length <= 6) {
            formattedValue = '+' + digits.slice(0, 2) + '-' + digits.slice(2);
          } else if (digits.length <= 9) {
            formattedValue = '+' + digits.slice(0, 2) + '-' + digits.slice(2, 5) + '-' + digits.slice(5);
          } else if (digits.length <= 12) {
            formattedValue = '+' + digits.slice(0, 2) + '-' + digits.slice(2, 5) + '-' + digits.slice(5, 8) + '-' + digits.slice(8);
          } else {
            // For longer numbers, use a more flexible format
            formattedValue = '+' + digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6, 10) + '-' + digits.slice(10, 15);
          }
        } else if (digits.length <= 10) {
          // Domestic format for other countries: XXX-XXX-XXXX
          if (digits.length <= 3) {
            formattedValue = digits;
          } else if (digits.length <= 6) {
            formattedValue = digits.slice(0, 3) + '-' + digits.slice(3);
          } else {
            formattedValue = digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6);
          }
        } else {
          formattedValue = digits;
        }
      }
      
      // Limit total length to prevent extremely long inputs
      if (formattedValue.length > 20) {
        formattedValue = formattedValue.slice(0, 20);
      }
    } else if (name === 'zipCode') {
      // Only allow 5-10 alphanumeric characters
      formattedValue = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue
    }));

    // Detect card type
    if (name === 'cardNumber') {
      detectCardType(formattedValue);
    }

    // Detect phone country
    if (name === 'phone') {
      detectPhoneCountry(formattedValue);
    }

    // Clear errors when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const detectCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) {
      setCardType('Visa');
    } else if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) {
      setCardType('Mastercard');
    } else if (/^3[47]/.test(number)) {
      setCardType('American Express');
    } else if (/^6(?:011|5)/.test(number)) {
      setCardType('Discover');
    } else {
      setCardType('');
    }
  };

  const detectPhoneCountry = (phoneNumber) => {
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Special handling for Pakistani numbers with operator detection
    if (digits.startsWith('92') || digits.startsWith('03') || (digits.startsWith('3') && digits.length <= 10)) {
      let prefix = '';
      
      // Extract the meaningful prefix for Pakistani operator detection
      if (digits.startsWith('92')) {
        prefix = digits.slice(2, 5); // Extract 3XX from +92-3XX-XXXXXXX
      } else if (digits.startsWith('0')) {
        prefix = digits.slice(1, 4); // Extract 3XX from 03XX-XXXXXXX
      } else {
        prefix = digits.slice(0, 3); // Extract 3XX from 3XX-XXXXXXX
      }
      
      // Determine Pakistani operator based on prefix (complete ranges)
      const prefixNum = parseInt(prefix);
      
      if ((prefixNum >= 300 && prefixNum <= 309) || (prefixNum >= 320 && prefixNum <= 329)) {
        setPhoneCountry('Pakistan (Jazz/Warid)');
        return;
      } else if (prefixNum >= 310 && prefixNum <= 319) {
        setPhoneCountry('Pakistan (Zong)');
        return;
      } else if (prefixNum >= 330 && prefixNum <= 339) {
        setPhoneCountry('Pakistan (Ufone)');
        return;
      } else if (prefixNum >= 340 && prefixNum <= 349) {
        setPhoneCountry('Pakistan (Telenor)');
        return;
      } else if (digits.startsWith('92') || digits.startsWith('03')) {
        setPhoneCountry('Pakistan');
        return;
      }
    }
    
    // Common country codes (first 1-3 digits)
    const countryCodes = {
      '1': 'US/Canada',
      '7': 'Russia/Kazakhstan',
      '20': 'Egypt',
      '27': 'South Africa',
      '30': 'Greece',
      '31': 'Netherlands',
      '32': 'Belgium',
      '33': 'France',
      '34': 'Spain',
      '36': 'Hungary',
      '39': 'Italy',
      '40': 'Romania',
      '41': 'Switzerland',
      '43': 'Austria',
      '44': 'United Kingdom',
      '45': 'Denmark',
      '46': 'Sweden',
      '47': 'Norway',
      '48': 'Poland',
      '49': 'Germany',
      '51': 'Peru',
      '52': 'Mexico',
      '53': 'Cuba',
      '54': 'Argentina',
      '55': 'Brazil',
      '56': 'Chile',
      '57': 'Colombia',
      '58': 'Venezuela',
      '60': 'Malaysia',
      '61': 'Australia',
      '62': 'Indonesia',
      '63': 'Philippines',
      '64': 'New Zealand',
      '65': 'Singapore',
      '66': 'Thailand',
      '81': 'Japan',
      '82': 'South Korea',
      '84': 'Vietnam',
      '86': 'China',
      '90': 'Turkey',
      '91': 'India',
      '92': 'Pakistan',
      '93': 'Afghanistan',
      '94': 'Sri Lanka',
      '95': 'Myanmar',
      '98': 'Iran',
      '212': 'Morocco',
      '213': 'Algeria',
      '216': 'Tunisia',
      '218': 'Libya',
      '220': 'Gambia',
      '221': 'Senegal',
      '222': 'Mauritania',
      '223': 'Mali',
      '224': 'Guinea',
      '225': 'Ivory Coast',
      '226': 'Burkina Faso',
      '227': 'Niger',
      '228': 'Togo',
      '229': 'Benin',
      '230': 'Mauritius',
      '231': 'Liberia',
      '232': 'Sierra Leone',
      '233': 'Ghana',
      '234': 'Nigeria',
      '235': 'Chad',
      '236': 'Central African Republic',
      '237': 'Cameroon',
      '238': 'Cape Verde',
      '239': 'São Tomé and Príncipe',
      '240': 'Equatorial Guinea',
      '241': 'Gabon',
      '242': 'Republic of the Congo',
      '243': 'Democratic Republic of the Congo',
      '244': 'Angola',
      '245': 'Guinea-Bissau',
      '246': 'British Indian Ocean Territory',
      '248': 'Seychelles',
      '249': 'Sudan',
      '250': 'Rwanda',
      '251': 'Ethiopia',
      '252': 'Somalia',
      '253': 'Djibouti',
      '254': 'Kenya',
      '255': 'Tanzania',
      '256': 'Uganda',
      '257': 'Burundi',
      '258': 'Mozambique',
      '260': 'Zambia',
      '261': 'Madagascar',
      '262': 'Mayotte/Réunion',
      '263': 'Zimbabwe',
      '264': 'Namibia',
      '265': 'Malawi',
      '266': 'Lesotho',
      '267': 'Botswana',
      '268': 'Eswatini',
      '269': 'Comoros',
      '290': 'Saint Helena',
      '291': 'Eritrea',
      '297': 'Aruba',
      '298': 'Faroe Islands',
      '299': 'Greenland',
      '350': 'Gibraltar',
      '351': 'Portugal',
      '352': 'Luxembourg',
      '353': 'Ireland',
      '354': 'Iceland',
      '355': 'Albania',
      '356': 'Malta',
      '357': 'Cyprus',
      '358': 'Finland',
      '359': 'Bulgaria',
      '370': 'Lithuania',
      '371': 'Latvia',
      '372': 'Estonia',
      '373': 'Moldova',
      '374': 'Armenia',
      '375': 'Belarus',
      '376': 'Andorra',
      '377': 'Monaco',
      '378': 'San Marino',
      '380': 'Ukraine',
      '381': 'Serbia',
      '382': 'Montenegro',
      '383': 'Kosovo',
      '385': 'Croatia',
      '386': 'Slovenia',
      '387': 'Bosnia and Herzegovina',
      '389': 'North Macedonia',
      '420': 'Czech Republic',
      '421': 'Slovakia',
      '423': 'Liechtenstein',
      '500': 'Falkland Islands',
      '501': 'Belize',
      '502': 'Guatemala',
      '503': 'El Salvador',
      '504': 'Honduras',
      '505': 'Nicaragua',
      '506': 'Costa Rica',
      '507': 'Panama',
      '508': 'Saint Pierre and Miquelon',
      '509': 'Haiti',
      '590': 'Guadeloupe',
      '591': 'Bolivia',
      '592': 'Guyana',
      '593': 'Ecuador',
      '594': 'French Guiana',
      '595': 'Paraguay',
      '596': 'Martinique',
      '597': 'Suriname',
      '598': 'Uruguay',
      '599': 'Netherlands Antilles',
      '670': 'East Timor',
      '672': 'Australian External Territories',
      '673': 'Brunei',
      '674': 'Nauru',
      '675': 'Papua New Guinea',
      '676': 'Tonga',
      '677': 'Solomon Islands',
      '678': 'Vanuatu',
      '679': 'Fiji',
      '680': 'Palau',
      '681': 'Wallis and Futuna',
      '682': 'Cook Islands',
      '683': 'Niue',
      '684': 'American Samoa',
      '685': 'Samoa',
      '686': 'Kiribati',
      '687': 'New Caledonia',
      '688': 'Tuvalu',
      '689': 'French Polynesia',
      '690': 'Tokelau',
      '691': 'Micronesia',
      '692': 'Marshall Islands',
      '850': 'North Korea',
      '852': 'Hong Kong',
      '853': 'Macau',
      '855': 'Cambodia',
      '856': 'Laos',
      '880': 'Bangladesh',
      '886': 'Taiwan',
      '960': 'Maldives',
      '961': 'Lebanon',
      '962': 'Jordan',
      '963': 'Syria',
      '964': 'Iraq',
      '965': 'Kuwait',
      '966': 'Saudi Arabia',
      '967': 'Yemen',
      '968': 'Oman',
      '970': 'Palestine',
      '971': 'UAE',
      '972': 'Israel',
      '973': 'Bahrain',
      '974': 'Qatar',
      '975': 'Bhutan',
      '976': 'Mongolia',
      '977': 'Nepal',
      '992': 'Tajikistan',
      '993': 'Turkmenistan',
      '994': 'Azerbaijan',
      '995': 'Georgia',
      '996': 'Kyrgyzstan',
      '998': 'Uzbekistan'
    };
    
    // Check for country code matches
    if (digits.length >= 7) {
      // Try 3-digit codes first
      const threeDigit = digits.slice(0, 3);
      if (countryCodes[threeDigit]) {
        setPhoneCountry(countryCodes[threeDigit]);
        return;
      }
      
      // Try 2-digit codes
      const twoDigit = digits.slice(0, 2);
      if (countryCodes[twoDigit]) {
        setPhoneCountry(countryCodes[twoDigit]);
        return;
      }
      
      // Try 1-digit codes
      const oneDigit = digits.slice(0, 1);
      if (countryCodes[oneDigit]) {
        setPhoneCountry(countryCodes[oneDigit]);
        return;
      }
    }
    
    // If no country detected or number too short
    setPhoneCountry('');
  };

  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      // Shipping validation
      if (!formData.firstName.trim()) errors.firstName = 'First name is required';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = 'Email is invalid';
      }
      if (!formData.phone.trim()) {
        errors.phone = 'Phone number is required';
      } else {
        const digits = formData.phone.replace(/\D/g, '');
        
        // Check if it's a Pakistani number first
        if (digits.startsWith('92') || digits.startsWith('03') || (digits.startsWith('3') && digits.length <= 10)) {
          // Validate Pakistani phone number format with strict length checking
          let isValidPakistani = false;
          
          if (digits.startsWith('92') && digits.length === 12) {
            // International format must be exactly 12 digits (92 + 10 digits)
            const validPakistaniPatterns = [
              /^92300\d{7}$/, /^92301\d{7}$/, /^92302\d{7}$/, /^92303\d{7}$/, /^92304\d{7}$/, 
              /^92305\d{7}$/, /^92306\d{7}$/, /^92307\d{7}$/, /^92308\d{7}$/, /^92309\d{7}$/, // Jazz/Warid (92300-92309)
              /^92320\d{7}$/, /^92321\d{7}$/, /^92322\d{7}$/, /^92323\d{7}$/, /^92324\d{7}$/, 
              /^92325\d{7}$/, /^92326\d{7}$/, /^92327\d{7}$/, /^92328\d{7}$/, /^92329\d{7}$/, // Jazz/Warid (92320-92329)
              /^92310\d{7}$/, /^92311\d{7}$/, /^92312\d{7}$/, /^92313\d{7}$/, /^92314\d{7}$/, 
              /^92315\d{7}$/, /^92316\d{7}$/, /^92317\d{7}$/, /^92318\d{7}$/, /^92319\d{7}$/, // Zong (92310-92319)
              /^92330\d{7}$/, /^92331\d{7}$/, /^92332\d{7}$/, /^92333\d{7}$/, /^92334\d{7}$/, 
              /^92335\d{7}$/, /^92336\d{7}$/, /^92337\d{7}$/, /^92338\d{7}$/, /^92339\d{7}$/, // Ufone (92330-92339)
              /^92340\d{7}$/, /^92341\d{7}$/, /^92342\d{7}$/, /^92343\d{7}$/, /^92344\d{7}$/, 
              /^92345\d{7}$/, /^92346\d{7}$/, /^92347\d{7}$/, /^92348\d{7}$/, /^92349\d{7}$/ // Telenor (92340-92349)
            ];
            isValidPakistani = validPakistaniPatterns.some(pattern => pattern.test(digits));
          } else if (digits.startsWith('03') && digits.length === 11) {
            // Local format must be exactly 11 digits (03 + 9 digits)
            const validPakistaniPatterns = [
              /^0300\d{7}$/, /^0301\d{7}$/, /^0302\d{7}$/, /^0303\d{7}$/, /^0304\d{7}$/, 
              /^0305\d{7}$/, /^0306\d{7}$/, /^0307\d{7}$/, /^0308\d{7}$/, /^0309\d{7}$/, // Jazz/Warid (0300-0309)
              /^0320\d{7}$/, /^0321\d{7}$/, /^0322\d{7}$/, /^0323\d{7}$/, /^0324\d{7}$/, 
              /^0325\d{7}$/, /^0326\d{7}$/, /^0327\d{7}$/, /^0328\d{7}$/, /^0329\d{7}$/, // Jazz/Warid (0320-0329)
              /^0310\d{7}$/, /^0311\d{7}$/, /^0312\d{7}$/, /^0313\d{7}$/, /^0314\d{7}$/, 
              /^0315\d{7}$/, /^0316\d{7}$/, /^0317\d{7}$/, /^0318\d{7}$/, /^0319\d{7}$/, // Zong (0310-0319)
              /^0330\d{7}$/, /^0331\d{7}$/, /^0332\d{7}$/, /^0333\d{7}$/, /^0334\d{7}$/, 
              /^0335\d{7}$/, /^0336\d{7}$/, /^0337\d{7}$/, /^0338\d{7}$/, /^0339\d{7}$/, // Ufone (0330-0339)
              /^0340\d{7}$/, /^0341\d{7}$/, /^0342\d{7}$/, /^0343\d{7}$/, /^0344\d{7}$/, 
              /^0345\d{7}$/, /^0346\d{7}$/, /^0347\d{7}$/, /^0348\d{7}$/, /^0349\d{7}$/ // Telenor (0340-0349)
            ];
            isValidPakistani = validPakistaniPatterns.some(pattern => pattern.test(digits));
          } else if (digits.startsWith('3') && digits.length === 10) {
            // Without leading 0: 3XX-XXXXXXX (exactly 10 digits)
            const validPakistaniPatterns = [
              /^300\d{7}$/, /^301\d{7}$/, /^302\d{7}$/, /^303\d{7}$/, /^304\d{7}$/, 
              /^305\d{7}$/, /^306\d{7}$/, /^307\d{7}$/, /^308\d{7}$/, /^309\d{7}$/, // Jazz/Warid (300-309)
              /^320\d{7}$/, /^321\d{7}$/, /^322\d{7}$/, /^323\d{7}$/, /^324\d{7}$/, 
              /^325\d{7}$/, /^326\d{7}$/, /^327\d{7}$/, /^328\d{7}$/, /^329\d{7}$/, // Jazz/Warid (320-329)
              /^310\d{7}$/, /^311\d{7}$/, /^312\d{7}$/, /^313\d{7}$/, /^314\d{7}$/, 
              /^315\d{7}$/, /^316\d{7}$/, /^317\d{7}$/, /^318\d{7}$/, /^319\d{7}$/, // Zong (310-319)
              /^330\d{7}$/, /^331\d{7}$/, /^332\d{7}$/, /^333\d{7}$/, /^334\d{7}$/, 
              /^335\d{7}$/, /^336\d{7}$/, /^337\d{7}$/, /^338\d{7}$/, /^339\d{7}$/, // Ufone (330-339)
              /^340\d{7}$/, /^341\d{7}$/, /^342\d{7}$/, /^343\d{7}$/, /^344\d{7}$/, 
              /^345\d{7}$/, /^346\d{7}$/, /^347\d{7}$/, /^348\d{7}$/, /^349\d{7}$/ // Telenor (340-349)
            ];
            isValidPakistani = validPakistaniPatterns.some(pattern => pattern.test(digits));
          }
          
          if (!isValidPakistani) {
            if (digits.startsWith('92')) {
              errors.phone = 'Pakistani international number must be exactly 12 digits (e.g., +92-300-1234567)';
            } else if (digits.startsWith('03')) {
              errors.phone = 'Pakistani mobile number must be exactly 11 digits (e.g., 0300-1234567)';
            } else {
              errors.phone = 'Please enter a valid Pakistani mobile number (e.g., 0300-1234567)';
            }
          }
        } else {
          // Validate international phone number format for other countries
          if (digits.length < 7) {
            errors.phone = 'Phone number too short (minimum 7 digits)';
          } else if (digits.length > 15) {
            errors.phone = 'Phone number too long (maximum 15 digits)';
          } else {
            // Check if it's a valid international format
            const isValidInternational = /^\+?[1-9]\d{6,14}$/.test(formData.phone.replace(/[\s-]/g, ''));
            if (!isValidInternational) {
              errors.phone = 'Please enter a valid phone number (e.g., 0300-1234567 for Pakistan, +1-555-123-4567 for US)';
            }
          }
        }
      }
      if (!formData.address.trim()) errors.address = 'Address is required';
      if (!formData.city.trim()) errors.city = 'City is required';
      if (!formData.state.trim()) errors.state = 'State is required';
      // ZIP code is now optional
    } else if (step === 2) {
      // No payment validation needed for HBL Pay
      // Payment will be handled by HBL Pay gateway
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "w-full px-3 py-2 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent text-white placeholder-white/60 backdrop-blur-sm";
    const errorClass = formErrors[fieldName] 
      ? 'border-red-400 focus:ring-red-400' 
      : 'border-white/30 focus:ring-blue-400';
    return `${baseClass} ${errorClass}`;
  };





  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/20 text-green-300 border border-green-400/30';
      case 'shipped':
        return 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30';
      default:
        return 'bg-white/10 text-white/80 border border-white/20';
    }
  };

  const steps = [
    { number: 1, title: 'Shipping', icon: FiTruck },
    { number: 2, title: 'Payment', icon: FiCreditCard },
    { number: 3, title: 'Review', icon: FiCheck }
  ];



  if (orderComplete) {
    return (
      <Layout title="Order Complete - BA Sports">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-500/20 backdrop-blur-xl border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheck size={40} className="text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Order Complete!
            </h1>
            <p className="text-white/80 mb-8">
              Thank you for your purchase. Your order has been confirmed and will be shipped soon.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/products')}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors font-medium backdrop-blur-sm"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }





  return (
    <Layout title="Checkout - BA Sports" description="Complete your purchase securely">
      {(cartActions) => {
        const { cartItems, clearCart } = cartActions;

        const handleOrderSubmit = async (cartItems, cartTotal) => {
          setIsProcessing(true);
          
          try {
            
            // Generate order ID
            const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`.toUpperCase();
            
            // Calculate total based on payment method
            const finalTotal = formData.paymentMethod === 'cod' ? cartTotal + 50 : cartTotal;
            
            // Store order details for payment success/cancel pages
            localStorage.setItem('lastOrderAmount', finalTotal.toString());
            localStorage.setItem('lastOrderItems', JSON.stringify(cartItems));
            localStorage.setItem('lastOrderEmail', formData.email);
            localStorage.setItem('lastOrderPaymentMethod', formData.paymentMethod);
            
            // FIXED: Validate cart items have valid product IDs
            const validCartItems = cartItems.filter(item => {
              const hasValidId = item.id || item.productId;
              if (!hasValidId) {
                return false;
              }
              
              // Ensure required fields exist
              if (!item.name || !item.price || !item.quantity) {
                return false;
              }
              
              return true;
            });
            
            if (validCartItems.length === 0) {
              throw new Error('No valid items in cart. Please refresh and try again.');
            }
            
            // FIXED: Check payment method and route accordingly
            if (formData.paymentMethod === 'cod') {
              // FIXED: Create proper order data structure
              const orderData = {
                orderId: orderId,
                customerName: `${formData.firstName} ${formData.lastName}`,
                customerEmail: formData.email,
                customerPhone: formData.phone,
                shippingAddress: formData.address,
                shippingCity: formData.city,
                shippingState: formData.state,
                shippingZipCode: formData.zipCode || null,
                items: validCartItems.map(item => ({
                  productId: item.id || item.productId,
                  quantity: parseInt(item.quantity),
                  price: parseFloat(item.price),
                  total: parseFloat(item.price) * parseInt(item.quantity)
                })),
                total: finalTotal
              };
              
              const codResponse = await fetch('/api/orders/create-cod-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
              });
              
              if (!codResponse.ok) {
                const errorText = await codResponse.text();
                throw new Error(`Server error: ${codResponse.status}`);
              }

              const codResult = await codResponse.json();

              if (!codResult.success) {
                const errorMsg = codResult.details 
                  ? `${codResult.error}: ${codResult.details.join(', ')}`
                  : codResult.error || 'COD order creation failed';
                throw new Error(errorMsg);
              }
              
              // Clear cart
              clearCart();
              
              // FIXED: Redirect with actual order data
              const actualOrderId = codResult.orderNumber || codResult.orderId || orderId;
              router.push(`/payment/success?order_id=${actualOrderId}&payment_method=cod&amount=${finalTotal}&order_number=${codResult.orderNumber}`);
              
            } else {
              // Handle other payment methods (credit card, etc.)
              throw new Error('Online payment processing not implemented yet');
            }
            
          } catch (error) {
            // FIXED: Better error messaging for users
            let userMessage = 'Order submission failed. Please try again.';
            
            if (error.message.includes('stock')) {
              userMessage = 'Some items in your cart are out of stock. Please update your cart and try again.';
            } else if (error.message.includes('Validation failed')) {
              userMessage = 'Please check that all required fields are filled correctly.';
            } else if (error.message.includes('Product not found')) {
              userMessage = 'Some products in your cart are no longer available. Please refresh your cart.';
            } else if (error.message.includes('Server error')) {
              userMessage = 'Server is temporarily unavailable. Please try again in a moment.';
            } else if (error.message) {
              userMessage = error.message;
            }
            
            // FIXED: Use Toast instead of alert for better UX
            setToastMessage(userMessage);
            setToastType('error');
            setShowToast(true);
            setIsProcessing(false);
          }
        };

        const handleStepSubmit = (cartItems, cartTotal) => (e) => {
          e.preventDefault();
          
          // Validate current step
          const isValid = validateStep(currentStep);
          
          if (!isValid) {
            return;
          }
          
          if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
          } else {
            handleOrderSubmit(cartItems, cartTotal);
          }
        };
        
        if (!cartItems || cartItems.length === 0) {
          return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-center"
              >
                <div className="w-20 h-20 bg-orange-500/20 backdrop-blur-xl border border-orange-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCreditCard size={40} className="text-orange-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-4">
                  Your Cart is Empty
                </h1>
                <p className="text-white/80 mb-8">
                  Add some items to your cart before proceeding to checkout.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/products')}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                  >
                    Shop Products
                  </button>
                  <button
                    onClick={() => router.push('/cart')}
                    className="w-full py-3 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors font-medium backdrop-blur-sm"
                  >
                    View Cart
                  </button>
                </div>
              </motion.div>
            </div>
          );
        }

        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        const shipping = subtotal > 50 ? 0 : 9.99;
        const total = subtotal + shipping;

        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <div className="relative text-white py-12 overflow-hidden">
          {/* Floating animations for checkout */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Floating credit cards */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`card-${i}`}
                className="absolute w-12 h-8 opacity-20"
                style={{
                  left: `${20 + (i * 25) % 60}%`,
                  top: `${30 + (i * 20) % 40}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-lg" />
                <div className="absolute top-1 left-1 w-3 h-2 bg-yellow-400/40 rounded-sm" />
                <div className="absolute bottom-1 right-1 w-4 h-1 bg-white/30 rounded" />
              </motion.div>
            ))}
            
            {/* Floating lock icons */}
            {[...Array(2)].map((_, i) => (
              <motion.div
                key={`lock-${i}`}
                className="absolute w-6 h-6 opacity-25"
                style={{
                  left: `${70 + (i * 15) % 25}%`,
                  top: `${25 + (i * 30) % 50}%`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.25, 0.4, 0.25],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 1.5
                }}
              >
                <FiLock size={24} className="text-green-400" />
              </motion.div>
            ))}
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl font-bold mb-4">Secure Checkout</h1>
              <p className="text-blue-100">Complete your purchase safely and securely</p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              {steps.map((step) => {
                const IconComponent = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                
                return (
                  <motion.div
                    key={step.number}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: step.number * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors backdrop-blur-sm ${
                      isCompleted 
                        ? 'bg-green-500/20 text-green-400 border border-green-400/50' 
                        : isActive 
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-400/50' 
                          : 'bg-white/10 text-white/60 border border-white/20'
                    }`}>
                      {isCompleted ? (
                        <FiCheck size={20} />
                      ) : (
                        <IconComponent size={20} />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-blue-400' : 'text-white/60'
                    }`}>
                      {step.title}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6"
              >
                <form onSubmit={handleStepSubmit(cartItems, total)}>
                  {/* Step 1: Shipping Information */}
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-bold text-white mb-6">
                        Shipping Information
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className={getInputClassName('firstName')}
                          />
                          {formErrors.firstName && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.firstName}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className={getInputClassName('lastName')}
                          />
                          {formErrors.lastName && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.lastName}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className={getInputClassName('email')}
                        />
                        {formErrors.email && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">
                          Phone Number *
                          {phoneCountry && (
                            <span className="ml-2 text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-400/30">
                              {phoneCountry}
                            </span>
                          )}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="0300-1234567"
                          required
                          className={getInputClassName('phone')}
                          title="Enter phone number (e.g., 0300-1234567 for Pakistan, +1-555-123-4567 for international)"
                        />
                        {formErrors.phone && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.phone}</p>
                        )}
                        {!formErrors.phone && (
                          <p className="text-white/50 text-xs mt-1">
                            {phoneCountry ? (
                              `${phoneCountry} number detected. Pakistani: 0300-1234567, International: +country-code`
                            ) : (
                              'Examples: 0300-1234567 (Pakistan), +1-555-123-4567 (US), +44-20-7946-0958 (UK)'
                            )}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white/80 mb-1">
                          Address *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className={getInputClassName('address')}
                        />
                        {formErrors.address && (
                          <p className="text-red-400 text-sm mt-1">{formErrors.address}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className={getInputClassName('city')}
                          />
                          {formErrors.city && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.city}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            State *
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className={getInputClassName('state')}
                          />
                          {formErrors.state && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.state}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white/80 mb-1">
                            ZIP Code (Optional)
                          </label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className={getInputClassName('zipCode')}
                            placeholder="Enter ZIP code (optional)"
                          />
                          {formErrors.zipCode && (
                            <p className="text-red-400 text-sm mt-1">{formErrors.zipCode}</p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Payment Method */}
                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-bold text-white mb-6">
                        Payment Method
                      </h2>
                      
                      <div className="space-y-6">

                        {/* Payment Summary */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                          <h4 className="text-lg font-semibold text-white mb-3">Payment Summary</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-white/60">Subtotal:</span>
                              <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Shipping:</span>
                              <span className="text-white font-medium">{formatPrice(shipping)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">COD Fee:</span>
                              <span className="text-white font-medium">{formatPrice(50)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/60">Payment Method:</span>
                              <span className="font-medium text-green-400">
                                Cash on Delivery
                              </span>
                            </div>
                            <div className="border-t border-white/10 pt-2">
                              <div className="flex justify-between">
                                <span className="text-white font-semibold">Total to Pay:</span>
                                <span className="text-white font-bold text-lg">
                                  {formatPrice(total + 50)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Security Notice */}
                        <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm border border-green-400/30 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <FiLock className="text-green-400" size={20} />
                              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                              <p className="text-white font-medium flex items-center gap-2">
                                Secure Order Processing
                                <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded">
                                  SSL Encrypted
                                </span>
                              </p>
                              <p className="text-white/60 text-sm">
                                Your order information is encrypted and secure
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Payment Methods Available */}
                        {formData.paymentMethod === 'hblpay' && (
                          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                            <h4 className="text-white font-medium mb-3">Available Payment Methods</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="flex flex-col items-center space-y-2 p-3 bg-white/5 rounded-lg">
                                <div className="w-8 h-5 bg-blue-600/20 rounded text-xs flex items-center justify-center text-white/60">
                                  Visa
                                </div>
                                <span className="text-xs text-white/60">Credit/Debit</span>
                              </div>
                              <div className="flex flex-col items-center space-y-2 p-3 bg-white/5 rounded-lg">
                                <div className="w-8 h-5 bg-red-600/20 rounded text-xs flex items-center justify-center text-white/60">
                                  MC
                                </div>
                                <span className="text-xs text-white/60">Credit/Debit</span>
                              </div>
                              <div className="flex flex-col items-center space-y-2 p-3 bg-white/5 rounded-lg">
                                <div className="w-8 h-5 bg-green-600/20 rounded text-xs flex items-center justify-center text-white/60">
                                  HBL
                                </div>
                                <span className="text-xs text-white/60">Mobile Banking</span>
                              </div>
                              <div className="flex flex-col items-center space-y-2 p-3 bg-white/5 rounded-lg">
                                <div className="w-8 h-5 bg-purple-600/20 rounded text-xs flex items-center justify-center text-white/60">
                                  IBFT
                                </div>
                                <span className="text-xs text-white/60">Bank Transfer</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* COD Information */}
                        {formData.paymentMethod === 'cod' && (
                          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                            <h4 className="text-white font-medium mb-3">Cash on Delivery Information</h4>
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                
                                
                              </div>
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                <span className="text-white/80 text-sm">Delivery within 2-3 business days</span>
                              </div>

                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                                <span className="text-white/80 text-sm">Please have exact change ready</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Review Order */}
                  {currentStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-6"
                    >
                      <h2 className="text-2xl font-bold text-white mb-6">
                        Review Your Order
                      </h2>
                      
                      <div className="space-y-6">
                        {/* Shipping Information Review */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-white mb-3">Shipping Address</h3>
                          <div className="text-white/80 space-y-1">
                            <p>{formData.firstName} {formData.lastName}</p>
                            <p>{formData.address}</p>
                            <p>{formData.city}, {formData.state}{formData.zipCode ? ` ${formData.zipCode}` : ''}</p>
                            <p>{formData.email}</p>
                            <p>{formData.phone}</p>
                          </div>
                        </div>

                        {/* Payment Information Review */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-white mb-3">Payment Method</h3>
                          <div className="text-white/80 space-y-1">
                            <p className={`font-medium ${
                              formData.paymentMethod === 'hblpay' ? 'text-blue-400' : 'text-green-400'
                            }`}>
                              {formData.paymentMethod === 'hblpay' ? 'HBL Pay Gateway' : 'Cash on Delivery'}
                            </p>
                            <p>
                              {formData.paymentMethod === 'hblpay' 
                                ? 'Secure payment processing by HBL Bank'
                                : 'Pay with cash when your order arrives'
                              }
                            </p>
                            <p className="text-sm text-white/60">
                              {formData.paymentMethod === 'hblpay' 
                                ? 'Multiple payment options available'
                                : 'Pay with cash when your order arrives'
                              }
                            </p>
                          </div>
                        </div>

                        {/* Order Items Review */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
                          <h3 className="text-lg font-semibold text-white mb-3">Order Items</h3>
                          <div className="space-y-3">
                            {cartItems.map((item) => (
                              <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                                <div className="flex items-center space-x-3">
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="w-12 h-12 object-cover rounded-lg"
                                  />
                                  <div>
                                    <p className="text-white font-medium">{item.name}</p>
                                    <p className="text-white/60 text-sm">Qty: {item.quantity}</p>
                                  </div>
                                </div>
                                <p className="text-white font-semibold">{formatPrice(item.price * item.quantity)}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-blue-500/10 backdrop-blur-sm border border-blue-400/30 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <FiCheck className="text-green-400" size={20} />
                            <div>
                              <p className="text-white font-medium">Ready to Complete Order</p>
                              <p className="text-white/60 text-sm">Please review all information before submitting</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/20">
                    {currentStep > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="px-6 py-2 border border-white/30 text-white/80 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm"
                      >
                        Back
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isProcessing}
                      className="ml-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : currentStep === 3 ? (
                        'Complete Order'
                      ) : (
                        'Continue'
                      )}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 sticky top-8"
              >
                <h3 className="text-xl font-bold text-white mb-4">Order Summary</h3>
                
                <div className="space-y-3 text-sm text-white/80">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{formatPrice(shipping)}</span>
                  </div>
                  {formData.paymentMethod === 'cod' && (
                    <div className="flex justify-between">
                      <span>COD Fee:</span>
                      <span>{formatPrice(50)}</span>
                    </div>
                  )}

                  <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between font-bold text-lg text-white">
                      <span>Total:</span>
                      <span>{formatPrice(formData.paymentMethod === 'cod' ? total + 50 : total)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* FIXED: Toast Notifications for better error handling */}
        <Toast
          show={showToast}
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      </div>
        );
      }}
    </Layout>
  );
};

export default CheckoutPage;
