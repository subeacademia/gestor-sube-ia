import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private readonly SERVICE_ID = 'service_d0m6iqn';
  private readonly TEMPLATE_ID = 'template_im1t8rq';
  private readonly PUBLIC_KEY = 'jlnRLQBC1jiIBM2bj';

  constructor() {
    emailjs.init(this.PUBLIC_KEY);
  }

  async enviarEmail(templateParams: any): Promise<any> {
    return emailjs.send(this.SERVICE_ID, this.TEMPLATE_ID, templateParams);
  }
} 