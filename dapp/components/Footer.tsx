import React from 'react';
import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';
import Image from 'next/image';
import Logo from '../assets/stacken.svg';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800/30 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {/* Brand + Description */}
          <div className="col-span-1 lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src={Logo}
                alt="Stacken Logo"
                className="object-contain"
                priority
              />
            </div>
            <span className="text-white text-base font-bold leading-tight cursor-pointer">
              Stacken
            </span>
          </div>
        </Link>
            <p className="text-gray-400 max-w-lg">
              Decentralized reward campaigns on the Stacks blockchain. Create engaging campaigns,
              reward your community, and build stronger connections.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a
                href="https://github.com/truthixify/stacken"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/campaigns" className="text-gray-400 hover:text-white transition-colors">
                  Browse Campaigns
                </Link>
              </li>
              <li>
                <Link
                  href="/campaigns/create"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Create Campaign
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>© 2025 Stacken. Built on the Stacks blockchain.</p>
          <p className="mt-2 md:mt-0">Made with ❤️ by StrawhatCrew for the Stacks community</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;