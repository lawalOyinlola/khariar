const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm">
              © {currentYear} Resumind. All rights reserved.
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm">
              Built with ❤️ by{" "}
              <span className="font-semibold text-white">YERO</span>
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            AI-powered resume analysis and optimization platform
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
