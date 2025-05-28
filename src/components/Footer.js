// Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>ООО "Пивовар"</h5>
            <p> Адрес: 124227, город Липецк, пл. Победы, д. 8, офис 58</p>
          </div>
          <div className="col-md-6 text-end">
            <ul className="list-unstyled">
              <li><Link to="/terms" className="text-white">TermsPage</Link></li>
              <li>+7 (999) 999-99-99</li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-3">
          <small>© {new Date().getFullYear()} ООО "Пивовар". Все права защищены.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;