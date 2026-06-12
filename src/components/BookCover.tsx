import React from 'react';

interface BookCoverProps {
  title: string;
  author: string;
  coverBg: string;
  coverPattern: 'stars' | 'waves' | 'grid' | 'circles';
  coverEmoji: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BookCover: React.FC<BookCoverProps> = ({
  title,
  author,
  coverBg,
  coverPattern,
  coverEmoji,
  size = 'md',
}) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const containerClasses = `relative flex flex-col justify-between overflow-hidden rounded-r-xl shadow-lg border-l-4 border-black/30 transition-all duration-300 select-none bg-gradient-to-br ${coverBg} ${
    isSm ? 'w-24 h-36 p-2' : isLg ? 'w-48 h-72 p-6' : 'w-36 h-52 p-4'
  }`;

  return (
    <div className={containerClasses} id={`book-cover-${title.replace(/\s+/g, '-').toLowerCase()}`}>
      {/* Spine effect */}
      <div className="absolute inset-y-0 left-0 w-1 bg-white/20 blur-[0.5px]" />
      <div className="absolute inset-y-0 left-1 w-0.5 bg-black/20" />

      {/* Decorative texture background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
        {coverPattern === 'stars' && (
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 3px, transparent 4px)', backgroundSize: '20px 20px' }} />
        )}
        {coverPattern === 'waves' && (
          <div className="absolute inset-0 h-full w-full" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.4) 10px, rgba(255,255,255,0.4) 12px)',
          }} />
        )}
        {coverPattern === 'grid' && (
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
        )}
        {coverPattern === 'circles' && (
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)', backgroundSize: '24px 24px' }} />
        )}
      </div>

      {/* Gold metallic accents */}
      <div className="absolute inset-x-2 top-2 bottom-2 border border-amber-400/20 rounded-md pointer-events-none" />

      {/* Top Banner details */}
      <div className="relative z-10 text-center">
        <p className={`text-amber-200/90 tracking-widest font-sans uppercase font-semibold leading-none ${
          isSm ? 'text-[8px] mb-1' : isLg ? 'text-xs mb-2' : 'text-[10px] mb-1.5'
        }`}>
          Reading League
        </p>
        <h3 className={`font-serif font-bold text-white tracking-tight leading-tight line-clamp-2 ${
          isSm ? 'text-[10px]' : isLg ? 'text-xl' : 'text-sm'
        }`}>
          {title}
        </h3>
      </div>

      {/* Center Emoji */}
      <div className="relative z-10 flex items-center justify-center my-auto">
        <span className={`drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transform hover:scale-110 transition-transform duration-300 ${
          isSm ? 'text-2xl' : isLg ? 'text-6xl' : 'text-4xl'
        }`}>
          {coverEmoji}
        </span>
      </div>

      {/* Bottom Author */}
      <div className="relative z-10 text-center">
        <div className="h-px bg-amber-400/30 my-1 mx-2" />
        <p className={`text-white/85 font-mono italic truncate ${
          isSm ? 'text-[8px]' : isLg ? 'text-[10px]' : 'text-[9px]'
        }`}>
          {author}
        </p>
      </div>

      {/* Glossy overlay sheen */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
    </div>
  );
};
