import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex grow items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex grow w-full items-center bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col w-full items-center justify-center pt-20 ">
          <Image
            className="dark"
            src="/logo.png"
            alt="Sophtasks logo"
            width={100}
            height={20}
            priority
          />
          <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
            <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50 pt-10 ">
              Sofia coding challenge
            </h1>
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400 pb-24">
              made by <b>Ali Villegas</b>
            </p>
            <div className="flex text-start text-base font-medium sm:flex-row">
              <a
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
                href="/tasks"
                rel="noopener noreferrer"
              >
                Explore
              </a>
            </div>
          </div>
        </div>
        <div className="hidden md:flex md:grow h-[89vh] w-full md:w-7/12 items-center justify-center ">
          <div className="block relative w-full h-full scale-125">
            <Image
              className="dark"
              src="/welcome.jpg"
              fill
              priority
              alt="sophtasks logo"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
