import Image from 'next/image';

export default function Header() {
  return (
    <div className="fixed top-0 left-0 right-0 p-4 sm:p-2 flex items-center gap-2 sm:gap-2 bg-white dark:bg-black z-10 border-b border-gray-100 dark:border-gray-900">
      <Image
        className="dark"
        src="/logo.png"
        alt="Sophtasks logo"
        width={80}
        height={16}
        priority
      />
      <h1 className="text-lg sm:text-2xl font-semibold text-black dark:text-zinc-50">
        Sofia Challenge
      </h1>
      <h2>by ali villegas</h2>
    </div>
  );
}
