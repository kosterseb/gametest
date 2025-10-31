import React from 'react';

export const EnemyAvatar = ({
  enemyName = 'enemy',
  isBoss = false
}) => {
  // Generate a consistent seed from enemy name
  // This ensures same enemy type always gets same avatar
  const getSeedFromName = (name) => {
    // Use enemy name as seed for consistent look per enemy type
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  // DiceBear API URL - using notionists style
  const getAvatarUrl = () => {
    const seed = getSeedFromName(enemyName);
    return `https://api.dicebear.com/9.x/notionists/svg?seed=${seed}&size=240`;
  };

  return (
    <div className="relative">
      {/* Enemy Avatar */}
      <div className="relative transition-all duration-300">
        <img
          src={getAvatarUrl()}
          alt={`${enemyName} Avatar`}
          className="w-48 h-48 md:w-56 md:h-56 rounded-full border-4 border-white shadow-2xl bg-gradient-to-br from-red-400 to-orange-500"
        />
      </div>
    </div>
  );
};
