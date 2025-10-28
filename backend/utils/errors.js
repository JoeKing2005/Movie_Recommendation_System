export class ProfileValidationError extends Error {
    constructor(message = "Profile fields failed to validate.") {
        super(message);
        this.name = "ProfileValidationError";
        this.status = 400;
    }
}

export class NameValidationError extends ProfileValidationError {
    constructor(message = "Name must not be blank and can only contain letters, dashes or spaces.") {
        super(message);
        this.name = "NameValidationError";
        this.status = super.status;
    }
}

export class EmailValidationError extends ProfileValidationError {
    constructor(message = "Email Address is invalid.") {
        super(message);
        this.name = "EmailValidationError";
        this.status = super.status;
    }
}

export class ProfileCreationError extends Error {
    constructor(message = "Server failed to create profile.") {
        super(message);
        this.name = "ProfileCreationError";
        this.status = 500;
    }
}
