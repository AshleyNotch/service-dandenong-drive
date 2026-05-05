// ─── All 24 reviews, split 6 per page ────────────────────────────────────────

export type Review = {
  name: string;
  avatar: string;
  rating: number;
  text: string;
};

export const homeReviews: Review[] = [
  {
    name: "Arshad Haque",
    avatar: "/src/assets/avatar-1.webp",
    rating: 5,
    text: "Been coming here for many years with all my family cars. Naveen is dedicated, knowledgeable and very trustworthy. Unlike other places, he's never tried to pull a fast one.",
  },
  {
    name: "Nalin Thamel",
    avatar: "/src/assets/avatar-2.webp",
    rating: 5,
    text: "Took all three of my cars to Mac City and couldn't be more impressed. Transparent, professional and the turnaround time was excellent. Each vehicle came back running smoother than ever.",
  },
  {
    name: "Dilshan Lawrence",
    avatar: "/src/assets/avatar-3.webp",
    rating: 5,
    text: "Ashen was outstanding — walked me through the repair clearly and professionally. My car was fixed quickly and I could immediately feel the difference. Fair pricing with no surprise costs.",
  },
  {
    name: "Vishmi Kaveesha",
    avatar: "/src/assets/avatar-4.webp",
    rating: 5,
    text: "Ashen did an outstanding job diagnosing and repairing an engine misfire. The car runs perfectly smooth again. Highly recommend Mac City for top-quality service.",
  },
  {
    name: "Vanisha Fernando",
    avatar: "/src/assets/avatar-5.webp",
    rating: 5,
    text: "Been going to Mac City for over a year. Naveen and the team are genuine, reliable and always take time to explain issues properly. I would 10/10 recommend them to anyone.",
  },
  {
    name: "Hardi Hidayat",
    avatar: "/src/assets/avatar-6.webp",
    rating: 5,
    text: "Been going to Mac City for more than 6 years. Always easy to book and accommodating to my schedule. Most importantly, the mechanics are honest. Thank you Naveen!",
  },
];

export const servicesReviews: Review[] = [
  {
    name: "Ben Beech",
    avatar: "/src/assets/avatar-7.webp",
    rating: 5,
    text: "Used Mac City multiple times for work and personal vehicles, often in emergency situations. Easy to deal with, well priced and they always get the job done.",
  },
  {
    name: "Nick Bracey",
    avatar: "/src/assets/avatar-8.webp",
    rating: 5,
    text: "Awesome mechanics — down to earth, honest and very well priced. Lovely people to deal with every single time. Would recommend these guys to absolutely anyone.",
  },
  {
    name: "Zoltan Szabo",
    avatar: "/src/assets/avatar-9.webp",
    rating: 5,
    text: "Used Mac City's towing service and Ash was professional, prompt and had great customer service. Highly recommend this business. Will definitely use their services again.",
  },
  {
    name: "Gary Teneza",
    avatar: "/src/assets/avatar-10.webp",
    rating: 5,
    text: "Been using Mac City for the past 5 years. Very friendly, easy to approach and always kind. Highly recommend — affordable charges and consistently great service.",
  },
  {
    name: "Milroy Sheriff",
    avatar: "/src/assets/avatar-11.webp",
    rating: 5,
    text: "Naveen is the best you can find when it comes to honesty and pricing. Straightforward, reliable and always delivers exactly what he promises. Wouldn't go anywhere else.",
  },
  {
    name: "John Moran",
    avatar: "/src/assets/avatar-12.webp",
    rating: 5,
    text: "Top mechanics with a great deal of experience. They do an excellent job every single time. Highly recommend Mac City to anyone looking for reliable car service.",
  },
];

export const aboutReviews: Review[] = [
  {
    name: "Ravi Patel",
    avatar: "/src/assets/avatar-13.webp",
    rating: 5,
    text: "Brought my Toyota in for a log book service and was really impressed. No unnecessary extras, clear communication and done on time. Will definitely be back.",
  },
  {
    name: "Aisha Mohamed",
    avatar: "/src/assets/avatar-14.webp",
    rating: 5,
    text: "First time here for a roadworthy inspection and the service was excellent. Fast, professional and the team was upfront about everything. Passed same day.",
  },
  {
    name: "Sam Nguyen",
    avatar: "/src/assets/avatar-15.webp",
    rating: 5,
    text: "Mac City has been my go-to workshop for three years. Fair prices, honest advice and they actually take the time to explain what's wrong with your car. Couldn't ask for more.",
  },
  {
    name: "Trish Kowalski",
    avatar: "/src/assets/avatar-16.webp",
    rating: 5,
    text: "Took my Hyundai in for a strange noise and they diagnosed it within the hour. Fixed quickly and for a very reasonable price. Great team, highly recommend.",
  },
  {
    name: "Daniel Pereira",
    avatar: "/src/assets/avatar-17.webp",
    rating: 5,
    text: "Check engine light came on and Mac City sorted it out the same day. Clear diagnosis with no unnecessary work added on. Exactly the kind of workshop you want.",
  },
  {
    name: "Lisa Chandra",
    avatar: "/src/assets/avatar-18.webp",
    rating: 5,
    text: "Been bringing my car here for two years and always leave satisfied. The team is honest, friendly and the pricing is fair. Won't be taking my car anywhere else.",
  },
];

export const contactReviews: Review[] = [
  {
    name: "Marcus Webb",
    avatar: "/src/assets/avatar-19.webp",
    rating: 5,
    text: "Used Mac City for a brake job and couldn't be happier. Took the time to show me what needed replacing and why. Great value and a genuinely trustworthy team.",
  },
  {
    name: "Priya Nair",
    avatar: "/src/assets/avatar-20.webp",
    rating: 5,
    text: "Naveen and the team are fantastic. Genuine, professional and never try to oversell you. My whole family now uses Mac City and we couldn't recommend them more highly.",
  },
  {
    name: "Tony Esposito",
    avatar: "/src/assets/avatar-21.webp",
    rating: 5,
    text: "Reliable, honest and always on time. I've been a customer for four years and the service has been consistently excellent. Definitely the best workshop in the area.",
  },
  {
    name: "Amanda Johansson",
    avatar: "/src/assets/avatar-22.webp",
    rating: 5,
    text: "Had a full service done here and the experience was seamless from start to finish. Clear communication, fair price and my car drives better than ever.",
  },
  {
    name: "Ezy",
    avatar: "/src/assets/avatar-23.webp",
    rating: 5,
    text: "Naveen is very polite, professional and always provides great service. A genuine pleasure to deal with every single time I bring my car in.",
  },
  {
    name: "Chris Martino",
    avatar: "/src/assets/avatar-24.webp",
    rating: 5,
    text: "These guys really know what they're doing. Brought in my European car which other workshops struggled with, and Mac City fixed it without any drama. Very impressive.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-sm text-[#fcbb04]">★</span>
      ))}
    </div>
  );
}

function Avatar({ src, name }: { src: string; name: string }) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white/10">
      <img
        src={src}
        alt={name}
        className="h-full w-full object-cover"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
      <span className="absolute inset-0 flex items-center justify-center font-mono-tag text-xs text-white/60">
        {initials}
      </span>
    </div>
  );
}

export function TestimonialsSection({ reviews }: { reviews: Review[] }) {
  return (
    <section className="bg-background py-24">
      <div className="container-page">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <p className="font-mono-tag text-muted-foreground">↳ What our customers say</p>
            <h2 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
              Trusted by locals<br />
              <span className="italic text-[#fcbb04]">across Melbourne's south-east</span>
            </h2>
          </div>
          <a
            href="https://maps.app.goo.gl/QZwHDjW8CAJGTCrg8"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm transition hover:border-white/30"
          >
            View on Google ↗
          </a>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((t) => (
            <div key={t.name} className="flex flex-col justify-between rounded-2xl border border-white/10 p-7">
              <p className="text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                <Avatar src={t.avatar} name={t.name} />
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <Stars />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
