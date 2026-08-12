export enum ErrorTypes {
    danger = "danger",
    error = "error",
    warning = "warning",
    info = "info"
  }
  
  export class Error {
    errorTitle: string;
    errorMessage: string;
    errorType: ErrorTypes;
  
    _errorClasses?: { [key in ErrorTypes]: string } = {
      danger: "alert-danger",
      error: "alert-error",
      warning: "alert-warning",
      info: "alert-info"
    };
    _errorClass?: string | undefined;
  
    constructor(
      errorTitle: string,
      errorMessage: string,
      errorType: ErrorTypes = ErrorTypes.error
    ) {
      this.errorTitle = errorTitle;
      this.errorMessage = errorMessage;
      this.errorType = errorType;
      if(this._errorClasses)
        this._errorClass = this._errorClasses[this.errorType];
    }

    getErrorClass = () => {
        if(this._errorClasses)
            return this._errorClasses[this.errorType];
        else 
            return null;
    }
  }
  