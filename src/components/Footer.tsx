import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Services Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 tracking-wide">
              {t.servicesOffered}
            </h3>
            <ul className="space-y-3">
              {t.servicesList.map((service, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-primary mr-2 mt-1">•</span>
                  <span className="leading-relaxed">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Location & Contact Section */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 tracking-wide">
              {t.locationAndContact}
            </h3>
            
            <div className="space-y-6">
              {/* Address */}
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">{t.addressLabel}</h4>
                  <p className="leading-relaxed text-slate-400">
                    {t.addressLine1}
                    <br />
                    {t.addressLine2}
                  </p>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-primary mt-1 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white mb-1">{t.phoneNumbersLabel}</h4>
                  <div className="flex flex-col space-y-1">
                    <a 
                      href="tel:+917200015790" 
                      className="text-slate-400 hover:text-white transition-colors hover:underline"
                    >
                      +91 72000 15790
                    </a>
                    <a 
                      href="tel:+919543950049" 
                      className="text-slate-400 hover:text-white transition-colors hover:underline"
                    >
                      +91 95439 50049
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
    </footer>
  );
};
