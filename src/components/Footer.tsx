export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            © 2025 Inception Deck Online. Built with Claude Code.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://buymeacoffee.com/ymstshinichiro"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-medium transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-.748-1.651-.36-.488-.861-.918-1.455-1.226C16.76 2.247 15.612 2 14.466 2c-1.146 0-2.294.247-3.347.872-.594.308-1.095.738-1.455 1.226-.36.488-.629 1.053-.748 1.651l-.132.666c-.119.598-.119 1.226 0 1.824.119.598.388 1.163.748 1.651.36.488.861.918 1.455 1.226.594.308 1.201.545 1.826.708V18h2v-6.264c.625-.163 1.232-.4 1.826-.708.594-.308 1.095-.738 1.455-1.226.36-.488.629-1.053.748-1.651.119-.598.119-1.226 0-1.824zM6 18c0 .551-.449 1-1 1s-1-.449-1-1V8c0-.551.449-1 1-1s1 .449 1 1v10zm14 0c0 .551-.449 1-1 1s-1-.449-1-1V8c0-.551.449-1 1-1s1 .449 1 1v10z" />
              </svg>
              Buy me a coffee
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
