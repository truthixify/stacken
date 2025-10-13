import React from 'react';
import Link from 'next/link';
import { Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold">Stacken Rewards</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Decentralized reward campaigns on the Stacks blockchain. Create engaging campaigns, 
              reward your community, and build stronger connections.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              {/* <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Discord size={20} />
              </a> */}
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/campaigns">
                  <a className="text-gray-400 hover:text-white transition-colors">
                    Browse Campaigns
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/campaigns/create">
                  <a className="text-gray-400 hover:text-white transition-colors">
                    Create Campaign
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/leaderboard">
                  <a className="text-gray-400 hover:text-white transition-colors">
                    Leaderboard
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-gray-400 hover:text-white transition-colors">
                    About Us
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/docs">
                  <a className="text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/api">
                  <a className="text-gray-400 hover:text-white transition-colors">
                    API Reference
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/support">
                  <a className="text-gray-400 hover:text-white transition-colors">
                    Support
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Stacken Rewards. Built on Stacks blockchain.
          </p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">
            Made with ❤️ for the Stacks community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;