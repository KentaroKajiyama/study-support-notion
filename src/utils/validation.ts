export class Validator {
  private readonly dateRegex: RegExp = /^\d{4}-\d{2}-\d{2}$/;
  private readonly emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly phoneRegex: RegExp = /^\+?[1-9]\d{1,14}$|^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
  private readonly urlRegex: RegExp = /^(https?:\/\/)?([\w\-]+(\.[\w\-]+)+)(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
  private readonly uuidRegex: RegExp = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

  public validateDate(dateString: string): boolean {
    return this.dateRegex.test(dateString) && !isNaN(Date.parse(dateString));
  }

  public validateEmail(email: string): boolean {
    return this.emailRegex.test(email);
  }

  public validatePhoneNumber(phoneNumber: string): boolean {
    return this.phoneRegex.test(phoneNumber);
  }

  public validateURL(url: string): boolean {
    return this.urlRegex.test(url);
  }

  public validateUUID(uuid: string): boolean {
    return this.uuidRegex.test(uuid);
  }
}