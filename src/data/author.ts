// Single source for author facts: the author box on posts and the Person JSON-LD both read from here.
export const author = {
  name: "Harindu Jayakody",
  role: "Founder of Infiax · full-stack developer, Sri Lanka",
  bio: "I build web apps, browser extensions and small tools that automate the boring parts. Here I write about AI coding tools, Windows fixes and the setups I actually use.",
  url: "https://harindujayakody.com/",
  email: "me@harindujayakody.com",
  links: [
    { label: "X", href: "https://x.com/harindu522" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/harindux/" },
    { label: "GitHub", href: "https://github.com/harindujayakody" },
  ],
};

export const authorJsonLd = (site: URL) => ({
  "@type": "Person",
  "@id": `${site.href}#person`,
  name: author.name,
  url: site.href,
  image: new URL("/avatar.png", site).href,
  sameAs: author.links.map((l) => l.href),
});
