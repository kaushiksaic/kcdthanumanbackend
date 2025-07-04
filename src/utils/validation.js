const validator = require('validator');


const ValidateSignUpData = async (req) => {
    const {phone_num,password,name,district,city,pincode,star,rashi,gothram,gender} = req.body;


    if(!phone_num || !password || !name) {
        return { success: false, message: 'All fields are required' };
        }
       
    // else if (!validator.isEmail(email)) {
    //     return { success: false, message: 'Not a valid email' };
    // }
    
    else if (!validator.isStrongPassword(password)) {
        return { success: false, message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' };
    }

    else if (!validator.isMobilePhone(phone_num, 'en-IN')) {
        return { success: false, message: 'Invalid mobile number' };
    }

    return { success: true };


    };


    module.exports = ValidateSignUpData;
