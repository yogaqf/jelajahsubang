import React from "react";
import Image from "next/image";

const Footer: React.FC = () => {
      return (
            <footer className="border-t border-zinc-200 bg-white py-6">
                  <div className="mx-auto w-full max-w-7xl px-3 sm:px-4">
                        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
                              <Image src="/images/logo.PNG" alt="Jelajah Subang" width={300} height={300} />
                              <div className="flex gap-10 lg:flex-row flex-col">
                                    <div className="flex gap-10">
                                          <div>
                                                <strong>Our Social Media</strong>
                                                <ul>
                                                      <li><a href="https://www.instagram.com/jelajahsubang/">Instagram</a></li>
                                                      <li><a href="https://www.facebook.com/jelajahsubang">Facebook</a></li>
                                                      <li><a href="https://twitter.com/jelajahsubang">Twitter</a></li>
                                                </ul>
                                          </div>
                                          <div>
                                                <strong>Our Partner</strong>
                                                <ul>
                                                      <li><a href="https://www.subangkab.go.id/">Pemerintah Kabupaten Subang</a></li>
                                                      <li><a href="https://www.disparbud.subangkab.go.id/">Dinas Pariwisata dan Kebudayaan Subang</a></li>
                                                </ul>
                                          </div>
                                    </div>

                                    <div className="flex gap-10">
                                          <div>
                                                <strong>Support Us</strong>
                                                <ul>
                                                      <li><a href="https://www.patreon.com/jelajahsubang">Patreon</a></li>
                                                      <li><a href="https://www.buymeacoffee.com/jelajahsubang">Buy Me a Coffee</a></li>
                                                </ul>
                                          </div>
                                          <div>
                                                <strong>Contact Us</strong>
                                                <ul>
                                                      <li>Email: <a href="mailto:info@jelajahsubang.com">info@jelajahsubang.com</a></li>
                                                </ul>
                                          </div>
                                    </div>


                              </div>

                        </div>

                        <p className="text-center text-sm text-zinc-500 mt-10">
                              &copy; {new Date().getFullYear()} Jelajah Subang. All rights reserved.
                        </p>
                  </div>
            </footer>
      );
};

export default Footer;