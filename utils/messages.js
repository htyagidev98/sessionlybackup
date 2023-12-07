const messages = {
    //Auth Controller,Teacher profile Controller Messages
    SIGN_UP_SUCCESS: "User Registered Successfully",
    LOGIN_SUCCESS: "LoggedIn Successfully",
    INVALID_EMAIL: "Invalid Email Address",
    INVALID_PASSWORD: "Password must have one lowercase letter, one uppercase letter, one digit, and one special character.",
    PASSWORD_CONFIRM_PASSWORD_NOT_MATCH: 'Password and Confirm Password do not match',
    EMAIL_EXISTING: "Email Already In Used",
    INVALID_CREDENATILS: "Invalid Credentials",
    ACCOUNT_STATUS: "Account is not Active!",
    SEND_LINK: "Reset password Link sent successfully. Please check your Email",
    NEW_PASSWORD_CONFIRM_PASSWORD_NOT_MATCH: "New_Password and Confirm Password do not match",
    RESET_PASSWORD: "Reset Password Successfully",
    INVALID_RESET_TOKEN: "Invalid Token.",
    PASSWORD_NOT_UPDATE: "Password Not Updateing!",
    CHANGE_PASSWORD_SUCCESS: "Change Password Successfully",
    OLD_PASSWORD_WRONG: "Old Password is Wrong",
    OLD_NEW_PASSWORD_NOT_SAME: "Old and new passwords cannot be the same.",

    //COMMON COURSE TEACHER User profile PAYMENT Messages 
    VALIDATION_ERROR: "Validation Error",
    SUCCESS_STATUS: "success",
    ERROR_STATUS: "error",
    SERVER_ERROR: "Internal Server Error",
    SUCCESSFULLY: "Successfully",
    NO_PROFILE_DATA: "No Profile data",
    NO_COURSE: "Course Not Found",
    NO_COURSES_LIST: "No Courses List",
    NO_STUDENTS: "NO Students List",
    NO_APPOINTMENTS_LIST: "NO Appointments List",
    NO_TRANSACTIONS_LIST: "No Transactions List",
    UPDATE_PROFILE_PIC: " Profile Picture Updated Successfully",
    UPDATE_PROFILE_DETAILS: " Profile Details Updated Successfully",
    NO_FILTER_DATA: "Filter Data Not Found",
    NO_CATEGORIES: "Categories Not Found",
    USER_NOT_FOUND: "User Not Found",

    //APPOINTMENT CONTROLLER Messages
    NOT_APPOINTMENT: "NO Appointment",
    Book_APPOINTMENT: "Appointment booked Successfully",
    EXIST_APPOINTMENT: "Appointment already booked for this time",

    //TEACHER  Controller Messages
    NO_PROFILE_PIC: "Profile Pic not found",
    NO_AVAILBILITY: "No Expert Availability",
    UPDATE_AVAILBILITY: "Expert Availability Updated Successfully",
    EXPERT_REGISTER: "Expert Registered Successfully",

    //Course Controller Messages
    ADD_COURSE: " Course Add Successfully",
    DELETE_SUCCESSFULLY: "Deleted Successfully",
    COURSE_UPDATE: "Course Update Successfully",
    NO_IMAGE_FILE: "File not provided",

    //Admin User Controller
    USER_DELETE: "User Deleted Successfully",
    USER_UPDATE: "User Updated Successfully",
    NO_EXPERTS: "NO Experts List",
    NO_USERS_LIST: "No Users List",

    //profile Controller
    NO_ADMIN: "Admin Not Found",

    //Notification Controller
    NO_NOTIFICATIONS: "No Notifications",
    ALL_NOTIYFICATIONS_READ: "All Notifications for user marked as read",

    //coupon
    NO_COUPON: "Coupons Not Found",
    ADD_COUPON: "Coupon created Successfully",
    UPDATE_COUPON: "Coupon Updated Successfully",
    EXIST_COUPON: "Coupon Already Exist",
    DELETE_COUPON: " Coupon Deleted Successfully",

    //CATEGORY
    NO_CATEGORY: "Category Not Found",
    ADD_CATEGORY: "Category Added Successfully",
    UPDATE_CATEGORY: "Category Updated Successfully",
    SUB_CATEGORY_EXIST: "Subcategory already exists in the category",
    DELETE_CATEGORY: " Category Deleted Successfully",

    //PAYMENT
    PAYMENT_SUCCESS: "Payment Successfully",
    INVALID_PAYMENT_ID: "Invalid or missing payment intent ID",
}
module.exports = messages;