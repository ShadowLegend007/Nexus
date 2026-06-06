import React from 'react';
import { Link } from 'react-router-dom';
import { Radio } from 'lucide-react';
import { FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

const links = {
  Product: ['Features', 'Security', 'Developers', 'Changelog'],
  Security: ['Zero-Knowledge', 'ML Threat Scan', 'Encryption', 'Compliance'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Developers: ['Documentation', 'API Reference', 'SDKs', 'Status'],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-black">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid sm:grid-cols-2 lg:grid-cols-6 gap-10">
        {/* Brand */}
        <div className="sm:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-white/20">
              <Radio size={16} className="text-black" />
            </div>
            <span className="font-black text-base tracking-widest uppercase text-white">
              Nexus
            </span>
          </div>
          <p className="text-sm leading-relaxed max-w-xs text-gray-400">
            Military-grade encrypted communications powered by AI threat intelligence.
          </p>
          <div className="flex items-center gap-3">
            {[
              { icon: FiGithub, href: '#' },
              { icon: FiTwitter, href: '#' },
              { icon: FiLinkedin, href: '#' },
            ].map(({ icon: Icon, href }) => (
              <a
                key={href + Icon.name}
                href={href}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 bg-white/5 border border-white/10 text-gray-400 hover:text-white"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(links).map(([category, items]) => (
          <div key={category}>
            <p className="text-xs font-bold uppercase tracking-[0.15em] mb-4 text-gray-500">{category}</p>
            <ul className="space-y-2.5">
              {items.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm transition-colors duration-200 text-gray-400 hover:text-white"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5">
        <p className="text-xs text-gray-500">2026 Nexus Inc. All rights reserved.</p>
        <div className="flex gap-6">
          {['Privacy Policy', 'Terms of Service', 'Security'].map((l) => (
            <a
              key={l}
              href="#"
              className="text-xs transition-colors duration-200 text-gray-500 hover:text-white"
            >
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
