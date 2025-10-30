

const Newsletter = () => {
  return (
    <section className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-8 md:mb-0 md:w-1/2 pr-0 md:pr-8">
              <span className="text-sm font-medium text-gray-400 tracking-widest uppercase">Stay Connected</span>
              <h2 className="text-3xl font-bold mt-2 mb-4">JOIN OUR NEWSLETTER</h2>
              <div className="w-16 h-1 bg-white mb-6"></div>
              <p className="text-gray-300">
                Subscribe to receive updates, exclusive offers, and styling tips. Be the first to know about new collections and special events.
              </p>
            </div>

            <div className="md:w-1/2">
              <form className="flex flex-col gap-4">
                <div className="flex flex-col">
                  <label htmlFor="name" className="text-sm mb-1 font-medium">Name</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Your name"
                    className="py-3 px-4 bg-transparent border border-gray-700 focus:outline-none focus:border-white text-white"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="email" className="text-sm mb-1 font-medium">Email</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Your email address"
                    className="py-3 px-4 bg-transparent border border-gray-700 focus:outline-none focus:border-white text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 bg-white text-black py-3 px-6 font-medium hover:bg-gray-200 transition-colors duration-300 uppercase tracking-wider">
                  Subscribe
                </button>
              </form>
              <p className="text-xs text-gray-400 mt-4">
                By subscribing, you agree to our Privacy Policy and consent to receive our marketing emails.
                You can unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Newsletter