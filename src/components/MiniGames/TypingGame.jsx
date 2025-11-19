import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

// Word list from the original game
const WORD_LIST = ['ACCOUNT','ACCURATE','ACRES','ACROSS','ACT','ACTION','ACTIVE','ACTIVITY',
  'ACTUAL','ACTUALLY','ADD','ADDITION','ADDITIONAL','ADJECTIVE','ADULT','ADVENTURE',
  'ADVICE','AFFECT','AFRAID','AFTER','AFTERNOON','AGAIN','AGAINST','AGE',
  'AGO','AGREE','AHEAD','AID','AIR','AIRPLANE','ALIKE','ALIVE',
  'ALL','ALLOW','ALMOST','ALONE','ALONG','ALOUD','ALPHABET','ALREADY',
  'ALSO','ALTHOUGH','AMONG','AMOUNT','ANCIENT','ANGLE','ANGRY',
  'ANIMAL','ANNOUNCED','ANOTHER','ANSWER','ANY','ANYBODY','ANYONE',
  'ANYTHING','ANYWAY','ANYWHERE','APART','APARTMENT','APPEARANCE','APPLE','APPLIED',
  'APPROPRIATE','AREA','ARMY','AROUND','ARRANGE','ARRANGEMENT',
  'ARRIVE','ARROW','ARTICLE','ASIDE','ASLEEP',
  'ATMOSPHERE','ATOM','ATOMIC','ATTACHED','ATTACK','ATTEMPT',
  'ATTENTION','AUDIENCE','AUTHOR','AUTOMOBILE','AVAILABLE','AVERAGE','AVOID','AWARE',
  'BABY','BACK','BADLY','BALANCE','BALL',
  'BALLOON','BAND','BANK','BARE','BARK','BARN','BASE',
  'BASEBALL','BASIC','BASIS','BASKET','BATTLE','BEAN',
  'BEAR','BEAT','BEAUTIFUL','BEAUTY','BECAME','BECAUSE','BECOME','BECOMING',
  'BEEN','BEFORE','BEGAN','BEGINNING','BEGUN','BEHAVIOR','BEHIND',
  'BEING','BELIEVED','BELL','BELONG','BELOW','BELT','BEND','BENEATH',
  'BENT','BESIDE','BEST','BETTER','BETWEEN','BEYOND','BICYCLE',
  'BIGGER','BIGGEST','BILL','BIRDS','BIRTH','BIRTHDAY','BITE',
  'BLACK','BLANK','BLANKET','BLEW','BLIND','BLOCK','BLOOD','BLOW',
  'BLUE','BOARD','BOAT','BODY','BONE','BOOK','BORDER','BORN',
  'BOTH','BOTTLE','BOTTOM','BOUND','BOWL','BRAIN','BRANCH','BRASS','BRAVE','BREAD','BREAK','BREAKFAST','BREATH',
  'BREATHE','BREATHING','BREEZE','BRICK','BRIDGE','BRIEF','BRIGHT','BRING',
  'BROAD','BROKE','BROKEN','BROTHER','BROUGHT','BROWN','BRUSH','BUFFALO',
  'BUILD','BUILDING','BUILT','BURIED','BURN','BURST','BUSINESS','BUSY','BUTTER',
  'CABIN','CAGE',
  'CAKE','CALL','CALM','CAME','CAMERA','CAMP','CANAL',
  'CANNOT','CAPITAL','CAPTAIN','CAPTURED','CARBON','CARD',
  'CARE','CAREFUL','CAREFULLY','CARRIED','CARRY','CASE','CAST','CASTLE',
  'CATCH','CATTLE','CAUGHT','CAUSE','CAVE','CELL','CENT',
  'CENTER','CENTRAL','CENTURY','CERTAIN','CERTAINLY','CHAIN','CHAIR','CHAMBER',
  'CHANCE','CHANGE','CHANGING','CHAPTER','CHARACTER','CHARACTERISTIC','CHARGE','CHART',
  'CHECK','CHEESE','CHEMICAL','CHEST','CHICKEN','CHIEF','CHILD','CHILDREN',
  'CHOICE','CHOOSE','CHOSE','CHOSEN','CHURCH','CIRCLE','CIRCUS','CITIZEN',
  'CITY','CLASS','CLASSROOM','CLAWS','CLAY','CLEAN','CLEAR','CLEARLY',
  'CLIMATE','CLIMB','CLOCK','CLOSE','CLOSET','CLOSELY','CLOSER','CLOTH','CLOTHES',
  'CLOTHING','CLOUD','CLUB','COACH','COAL','COAST','COAT','COFFEE',
  'COLD','COLLECT','COLLEGE','COLONY','COLOR','COLUMN','COMBINATION','COMBINE',
  'COME','COMFORTABLE','COMING','COMMAND','COMMON','COMMUNITY','COMPANY','COMPARE',
  'COMPASS','COMPLETE','COMPLETELY','COMPLEX','COMPOSED','COMPOSITION','COMPOUND','CONCERNED',
  'CONDITION','CONGRESS','CONNECTED','CONSIDER','CONSIST','CONSONANT','CONSTANTLY','CONSTRUCTION',
  'CONTAIN','CONTINENT','CONTINUED','CONTRAST','CONTROL','CONVERSATION','COOK',
  'COOL','COPPER','COPY','CORN','CORNER','CORRECT','CORRECTLY','COST',
  'COTTON','COULD','COUNT','COUNTRY','COUPLE','COURAGE','COURSE','COURT',
  'COVER','CRACK','CREAM','CREATE','CREATURE','CREW',
  'CROP','CROSS','CROWD','CURIOUS','CURRENT','CURVE',
  'CUSTOMS','CUTTING','DAILY','DAMAGE','DANCE','DANGER','DANGEROUS',
  'DARK','DARKNESS','DATE','DAUGHTER','DAWN','DEAD','DEAL',
  'DEAR','DEATH','DECIDE','DECLARED','DEEP','DEEPLY','DEER','DEFINITION',
  'DEGREE','DEPEND','DEPTH','DESCRIBE','DESERT','DESIGN','DESK','DETAIL',
  'DETERMINE','DEVELOP','DEVELOPMENT','DIAGRAM','DIAMETER','DIFFER',
  'DIFFERENCE','DIFFERENT','DIFFICULT','DIFFICULTY','DINNER','DIRECT','DIRECTION',
  'DIRECTLY','DIRT','DIRTY','DISAPPEAR','DISCOVER','DISCOVERY','DISCUSS','DISCUSSION',
  'DISEASE','DISH','DISTANCE','DISTANT','DIVIDE','DIVISION','DOCTOR',
  'DOES','DOING','DOLL','DOLLAR','DONE','DONKEY','DOOR',
  'DOUBLE','DOUBT','DOWN','DOZEN','DRAW','DRAWN','DREAM',
  'DRESS','DREW','DRIED','DRINK','DRIVE','DRIVEN','DRIVER','DRIVING',
  'DROP','DROPPED','DROVE','DUCK','DURING','DUST','DUTY','EACH','EAGER','EARLIER','EARLY',
  'EARN','EARTH','EASIER','EASILY','EAST','EASY','EATEN',
  'EDGE','EDUCATION','EFFECT','EFFORT','EIGHT','EITHER','ELECTRIC',
  'ELECTRICITY','ELEMENT','ELEPHANT','ELEVEN','ELSE','EMPTY','ENEMY',
  'ENERGY','ENGINE','ENGINEER','ENJOY','ENOUGH','ENTER','ENTIRE','ENTIRELY',
  'ENVIRONMENT','EQUAL','EQUALLY','EQUATOR','EQUIPMENT','ESCAPE','ESPECIALLY','ESSENTIAL',
  'ESTABLISH','EVEN','EVENING','EVENT','EVENTUALLY','EVER','EVERY','EVERYBODY',
  'EVERYONE','EVERYTHING','EVERYWHERE','EVIDENCE','EXACT','EXACTLY','EXAMINE','EXAMPLE',
  'EXCELLENT','EXCEPT','EXCHANGE','EXCITED','EXCITEMENT','EXCITING','EXCLAIMED','EXERCISE',
  'EXIST','EXPECT','EXPERIENCE','EXPERIMENT','EXPLAIN','EXPLANATION','EXPLORE','EXPRESS',
  'EXPRESSION','EXTRA','FACE','FACING','FACT','FACTOR','FACTORY',
  'FAILED','FAIR','FAIRLY','FALL','FALLEN','FAMILIAR','FAMILY','FAMOUS',
  'FARM','FARMER','FARTHER','FAST','FASTENED','FASTER',
  'FATHER','FAVORITE','FEAR','FEATHERS','FEATURE','FEED','FEEL',
  'FEET','FELL','FELLOW','FELT','FENCE','FEWER','FIELD',
  'FIERCE','FIFTEEN','FIFTH','FIFTY','FIGHT','FIGHTING','FIGURE','FILL',
  'FILM','FINAL','FINALLY','FIND','FINE','FINEST','FINGER','FINISH',
  'FIRE','FIREPLACE','FIRM','FIRST','FISH','FIVE','FLAG',
  'FLAME','FLAT','FLEW','FLIES','FLIGHT','FLOATING','FLOOR','FLOW',
  'FLOWER','FOLKS','FOLLOW','FOOD','FOOT','FOOTBALL',
  'FORCE','FOREIGN','FOREST','FORGET','FORGOT','FORGOTTEN','FORM',
  'FORMER','FORT','FORTH','FORTY','FORWARD','FOUGHT','FOUND','FOUR',
  'FOURTH','FRAME','FREE','FREEDOM','FREQUENTLY','FRESH','FRIEND',
  'FRIENDLY','FRIGHTEN','FROG','FROM','FRONT','FROZEN','FRUIT','FUEL',
  'FULL','FULLY','FUNCTION','FUNNY','FURNITURE','FURTHER',
  'FUTURE','GAIN','GAME','GARAGE','GARDEN','GASOLINE','GATE',
  'GATHER','GAVE','GENERAL','GENERALLY','GENTLE','GENTLY','GETTING',
  'GIANT','GIFT','GIRL','GIVE','GIVEN','GIVING','GLAD','GLASS',
  'GLOBE','GOES','GOLD','GOLDEN','GONE','GOOD','GOOSE',
  'GOVERNMENT','GRABBED','GRADE','GRADUALLY','GRAIN','GRANDFATHER','GRANDMOTHER',
  'GRAPH','GRASS','GRAVITY','GRAY','GREAT','GREATER','GREATEST','GREATLY',
  'GREEN','GREW','GROUND','GROUP','GROW','GROWN','GROWTH','GUARD',
  'GUESS','GUIDE','GULF','HABIT','HAIR','HALF',
  'HALFWAY','HALL','HAND','HANDLE','HANDSOME','HANG','HAPPEN','HAPPENED',
  'HAPPILY','HAPPY','HARBOR','HARD','HARDER','HARDLY',
  'HAVE','HAVING','HEADED','HEADING','HEALTH','HEARD',
  'HEARING','HEART','HEAT','HEAVY','HEIGHT','HELD','HELLO','HELP',
  'HELPFUL','HERD','HERE','HERSELF','HIDDEN','HIDE','HIGH',
  'HIGHER','HIGHEST','HIGHWAY','HILL','HIMSELF','HISTORY',
  'HOLD','HOLE','HOLLOW','HOME','HONOR','HOPE','HORN',
  'HORSE','HOSPITAL','HOUR','HOUSE','HOWEVER','HUGE',
  'HUMAN','HUNDRED','HUNG','HUNGRY','HUNT','HUNTER','HURRIED','HURRY',
  'HURT','HUSBAND','IDEA','IDENTITY','IMAGE',
  'IMAGINE','IMMEDIATELY','IMPORTANCE','IMPORTANT','IMPOSSIBLE','IMPROVE','INCH',
  'INCLUDE','INCLUDING','INCOME','INCREASE','INDEED','INDEPENDENT','INDICATE','INDIVIDUAL',
  'INDUSTRIAL','INDUSTRY','INFLUENCE','INFORMATION','INSIDE','INSTANCE','INSTANT','INSTEAD',
  'INSTRUMENT','INTEREST','INTERIOR','INTO','INTRODUCED','INVENTED','INVOLVED','IRON',
  'ISLAND','ITSELF','JOURNEY','JUDGE','JUMP','JUNGLE',
  'JUST','KEEP','KEPT','KIDS','KILL','KIND','KITCHEN',
  'KNEW','KNIFE','KNOW','KNOWLEDGE','KNOWN','LABEL','LABOR','LACK',
  'LADY','LAID','LAKE','LAMP','LAND','LANGUAGE','LARGE','LARGER',
  'LARGEST','LAST','LATE','LATER','LAUGH','LAYERS',
  'LEAD','LEADER','LEAF','LEARN','LEAST','LEATHER','LEAVE','LEAVING',
  'LEFT','LENGTH','LESSON','LETTER','LEVEL',
  'LIBRARY','LIFE','LIFT','LIGHT','LIKE','LIKELY','LIMITED',
  'LINE','LION','LIPS','LIQUID','LIST','LISTEN','LITTLE','LIVE',
  'LIVING','LOAD','LOCAL','LOCATE','LOCATION','LONELY','LONG',
  'LONGER','LOOK','LOOSE','LOSE','LOSS','LOST','LOUD',
  'LOVE','LOVELY','LOWER','LUCK','LUCKY','LUNCH','LUNGS',
  'LYING','MACHINE','MACHINERY','MADE','MAGIC','MAGNET','MAIL',
  'MAIN','MAINLY','MAJOR','MAKE','MAKING','MANAGED','MANNER',
  'MANUFACTURING','MANY','MARK','MARKET','MARRIED','MASS','MASSAGE',
  'MASTER','MATERIAL','MATHEMATICS','MATTER','MAYBE','MEAL',
  'MEAN','MEANS','MEANT','MEASURE','MEAT','MEDICINE','MEET','MELTED',
  'MEMBER','MEMORY','MENTAL','MERELY','MET','METAL','METHOD',
  'MICE','MIDDLE','MIGHT','MIGHTY','MILE','MILITARY','MILK','MILL',
  'MIND','MINE','MINERALS','MINUTE','MIRROR','MISSING','MISSION','MISTAKE',
  'MIXTURE','MODEL','MODERN','MOLECULAR','MOMENT','MONEY','MONKEY',
  'MONTH','MOOD','MOON','MORE','MORNING','MOST','MOSTLY','MOTHER',
  'MOTION','MOTOR','MOUNTAIN','MOUSE','MOUTH','MOVE','MOVEMENT','MOVIE',
  'MOVING','MUSCLE','MUSIC','MUSICAL','MUST','MYSELF',
  'MYSTERIOUS','NAILS','NAME','NATION','NATIONAL','NATIVE','NATURAL','NATURALLY',
  'NATURE','NEAR','NEARBY','NEARER','NEAREST','NEARLY','NECESSARY','NECK',
  'NEEDED','NEEDLE','NEEDS','NEGATIVE','NEIGHBOR','NEIGHBORHOOD','NERVOUS','NEST',
  'NEVER','NEWS','NEWSPAPER','NEXT','NICE','NIGHT','NINE',
  'NOBODY','NODDED','NOISE','NONE','NOON','NORTH',
  'NOSE','NOTE','NOTED','NOTHING','NOTICE','NOUN',
  'NUMBER','NUMERAL','NUTS','OBJECT','OBSERVE','OBTAIN','OCCASIONALLY','OCCUR',
  'OCEAN','OFFER','OFFICE','OFFICER','OFFICIAL',
  'OLDER','OLDEST','ONCE','ONLY','ONTO',
  'OPEN','OPERATION','OPINION','OPPORTUNITY','OPPOSITE','ORANGE','ORBIT',
  'ORDER','ORDINARY','ORGANIZATION','ORGANIZED','ORIGIN','ORIGINAL','OTHER','OUGHT',
  'OURSELVES','OUTER','OUTLINE','OUTSIDE','OVER',
  'OWNER','OXYGEN','PACK','PACKAGE','PAGE','PAID','PAIN','PAINT',
  'PAIR','PALACE','PALE','PAPER','PARAGRAPH','PARALLEL','PARENT',
  'PARK','PART','PARTICLES','PARTICULAR','PARTICULARLY','PARTLY','PARTS','PARTY',
  'PASS','PASSAGE','PAST','PATH','PATTERN','PEACE',
  'PENCIL','PEOPLE','PERCENT','PERFECT','PERFECTLY','PERHAPS','PERIOD',
  'PERSON','PERSONAL','PHRASE','PHYSICAL','PIANO','PICK','PICTURE',
  'PICTURED','PIECE','PILE','PILOT','PINE','PINK',
  'PIPE','PITCH','PLACE','PLAIN','PLAN','PLANE','PLANET','PLANNED',
  'PLANNING','PLANT','PLASTIC','PLATE','PLATES','PLAY','PLEASANT','PLEASE',
  'PLEASURE','PLENTY','PLURAL','PLUS','POCKET','POEM','POET','POETRY',
  'POINT','POLE','POLICE','POLICEMAN','POLITICAL','POND','PONY','POOL',
  'POOR','POPULAR','POPULATION','PORCH','PORT','POSITION','POSITIVE','POSSIBLE',
  'POSSIBLY','POST','POTATOES','POUND','POUR','POWDER','POWER',
  'POWERFUL','PRACTICAL','PRACTICE','PREPARE','PRESENT','PRESIDENT','PRESS','PRESSURE',
  'PRETTY','PREVENT','PREVIOUS','PRICE','PRIDE','PRIMITIVE','PRINCIPAL','PRINCIPLE',
  'PRINTED','PRIVATE','PRIZE','PROBABLY','PROBLEM','PROCESS','PRODUCE','PRODUCT',
  'PRODUCTION','PROGRAM','PROGRESS','PROMISED','PROPER','PROPERLY','PROPERTY','PROTECTION',
  'PROUD','PROVE','PROVIDE','PUBLIC','PULL','PUPIL','PURE','PURPLE',
  'PURPOSE','PUSH','PUTTING','QUARTER','QUEEN','QUESTION','QUICK',
  'QUICKLY','QUIET','QUIETLY','QUITE','RABBIT','RACE','RADIO','RAILROAD',
  'RAIN','RAISE','RANCH','RANGE','RAPIDLY','RATE','RATHER',
  'RAYS','REACH','READ','READER','READY','REAL','REALIZE',
  'REAR','REASON','RECALL','RECEIVE','RECENT','RECENTLY','RECOGNIZE','RECORD',
  'REFER','REFUSED','REGION','REGULAR','RELATED','RELATIONSHIP','RELIGIOUS',
  'REMAIN','REMARKABLE','REMEMBER','REMOVE','REPEAT','REPLACE','REPLIED','REPORT',
  'REPRESENT','REQUIRE','RESEARCH','RESPECT','REST','RESULT','RETURN','REVIEW',
  'RHYME','RHYTHM','RICE','RICH','RIDE','RIDING','RIGHT','RING',
  'RISE','RISING','RIVER','ROAD','ROAR','ROCK','ROCKET','ROCKY',
  'ROLL','ROOF','ROOM','ROOT','ROPE','ROSE','ROUGH',
  'ROUND','ROUTE','RUBBED','RUBBER','RULE','RULER',
  'RUNNING','RUSH','SADDLE','SAFE','SAFETY','SAID','SAIL',
  'SALE','SALMON','SALT','SAME','SAND','SANG','SATELLITES',
  'SATISFIED','SAVE','SAVED','SCALE','SCARED','SCENE',
  'SCHOOL','SCIENCE','SCIENTIFIC','SCIENTIST','SCORE','SCREEN','SEA','SEARCH',
  'SEASON','SEAT','SECOND','SECRET','SECTION','SEED','SEEING',
  'SEEMS','SEEN','SELDOM','SELECT','SELECTION','SELL','SEND','SENSE',
  'SENT','SENTENCE','SEPARATE','SERIES','SERIOUS','SERVE','SERVICE','SETS',
  'SETTING','SETTLE','SETTLERS','SEVEN','SEVERAL','SHADE','SHADOW','SHAKE',
  'SHAKING','SHALL','SHALLOW','SHAPE','SHARE','SHARP','SHEEP',
  'SHEET','SHELF','SHELLS','SHELTER','SHINE','SHINNING','SHIP','SHIRT',
  'SHOE','SHOOT','SHOP','SHORE','SHORT','SHORTER','SHOT','SHOULD',
  'SHOULDER','SHOUT','SHOW','SHOWN','SHUT','SICK','SIDES','SIGHT',
  'SIGN','SIGNAL','SILENCE','SILENT','SILK','SILLY','SILVER','SIMILAR',
  'SIMPLE','SIMPLEST','SIMPLY','SINCE','SING','SINGLE','SINK','SISTER',
  'SITTING','SITUATION','SIZE','SKILL','SKIN',
  'SLABS','SLAVE','SLEEP','SLEPT','SLIDE','SLIGHT','SLIGHTLY','SLIP',
  'SLIPPED','SLOPE','SLOW','SLOWLY','SMALL','SMALLER','SMALLEST','SMELL',
  'SMILE','SMOKE','SMOOTH','SNAKE','SNOW','SOAP','SOCIAL',
  'SOCIETY','SOFT','SOFTLY','SOIL','SOLAR','SOLD','SOLDIER','SOLID',
  'SOLUTION','SOLVE','SOME','SOMEBODY','SOMEHOW','SOMEONE','SOMETHING','SOMETIME',
  'SOMEWHERE','SONG','SOON','SORT','SOUND','SOURCE','SOUTH',
  'SOUTHERN','SPACE','SPEAK','SPECIAL','SPECIES','SPECIFIC','SPEECH','SPEED',
  'SPELL','SPEND','SPENT','SPIDER','SPIN','SPIRIT','SPITE','SPLIT',
  'SPOKEN','SPORT','SPREAD','SPRING','SQUARE','STAGE','STAIRS','STAND',
  'STANDARD','STAR','STARED','START','STATE','STATEMENT','STATION','STAY',
  'STEADY','STEAM','STEEL','STEEP','STEMS','STEP','STEPPED','STICK',
  'STIFF','STILL','STOCK','STOMACH','STONE','STOOD','STOP','STOPPED',
  'STORE','STORM','STORY','STOVE','STRAIGHT','STRANGE','STRANGER','STRAW',
  'STREAM','STREET','STRENGTH','STRETCH','STRIKE','STRING','STRIP','STRONG',
  'STRONGER','STRUCK','STRUCTURE','STRUGGLE','STUCK','STUDENT','STUDIED','STUDYING',
  'SUBJECT','SUBSTANCE','SUCCESS','SUCCESSFUL','SUCH','SUDDEN','SUDDENLY','SUGAR',
  'SUGGEST','SUIT','SUMMER','SUNLIGHT','SUPPER','SUPPLY',
  'SUPPORT','SUPPOSE','SURE','SURFACE','SURPRISE','SURROUNDED','SWAM','SWEET',
  'SWEPT','SWIM','SWIMMING','SWING','SWUNG','SYLLABLE','SYMBOL','SYSTEM',
  'TABLE','TAIL','TAKE','TAKEN','TALES','TALK','TALL','TANK',
  'TAPE','TASK','TASTE','TAUGHT','TEACH','TEACHER',
  'TEAM','TEARS','TEETH','TELEPHONE','TELEVISION','TELL','TEMPERATURE',
  'TENT','TERM','TERRIBLE','TEST','THAN','THANK','THAT','THEE',
  'THEM','THEMSELVES','THEN','THEORY','THERE','THEREFORE','THESE','THEY',
  'THICK','THIN','THING','THINK','THIRD','THIRTY','THIS','THOSE',
  'THOU','THOUGH','THOUGHT','THOUSAND','THREAD','THREE','THREW','THROAT',
  'THROUGH','THROUGHOUT','THROW','THROWN','THUMB','THUS','TIDE',
  'TIGHT','TIGHTLY','TILL','TIME','TINY',
  'TIRED','TITLE','TOBACCO','TODAY','TOGETHER','TOLD','TOMORROW',
  'TONE','TONGUE','TONIGHT','TOOK','TOOL','TOPIC',
  'TORN','TOTAL','TOUCH','TOWARD','TOWER','TOWN','TRACE',
  'TRACK','TRADE','TRAFFIC','TRAIL','TRAIN','TRANSPORTATION','TRAP','TRAVEL',
  'TREATED','TREE','TRIANGLE','TRIBE','TRICK','TRIED','TRIP','TROOPS',
  'TROPICAL','TROUBLE','TRUCK','TRUNK','TRUTH','TUBE','TUNE',
  'TURN','TWELVE','TWENTY','TWICE','TYPE','TYPICAL','UNCLE',
  'UNDER','UNDERLINE','UNDERSTANDING','UNHAPPY','UNION','UNIT','UNIVERSE','UNKNOWN',
  'UNLESS','UNTIL','UNUSUAL','UPON','UPPER','UPWARD',
  'USEFUL','USING','USUAL','USUALLY','VALLEY','VALUABLE','VALUE',
  'VAPOR','VARIETY','VARIOUS','VAST','VEGETABLE','VERB','VERTICAL','VERY',
  'VESSELS','VICTORY','VIEW','VILLAGE','VISIT','VISITOR','VOICE','VOLUME',
  'VOTE','VOWEL','VOYAGE','WAGON','WAIT','WALK','WALL','WANT',
  'WARM','WARN','WASH','WASTE','WATCH','WATER',
  'WAVE','WEAK','WEALTH','WEAR','WEATHER','WEEK',
  'WEIGH','WEIGHT','WELCOME','WELL','WENT','WERE','WEST','WESTERN',
  'WHALE','WHAT','WHATEVER','WHEAT','WHEEL','WHEN','WHENEVER',
  'WHERE','WHEREVER','WHETHER','WHICH','WHILE','WHISPERED','WHISTLE','WHITE',
  'WHO','WHOLE','WHOM','WHOSE','WIDE','WIDELY','WIFE',
  'WILD','WILL','WILLING','WIND','WINDOW','WING','WINTER',
  'WIRE','WISE','WISH','WITH','WITHIN','WITHOUT','WOLF','WOMEN',
  'WONDER','WONDERFUL','WOOD','WOODEN','WOOL','WORD','WORE',
  'WORK','WORKER','WORLD','WORRIED','WORRY','WORSE','WORTH','WOULD',
  'WRAPPED','WRITE','WRITER','WRITING','WRITTEN','WRONG','WROTE','YARD',
  'YEAR','YELLOW','YESTERDAY','YOUNG','YOUNGER',
  'YOUR','YOURSELF','YOUTH','ZERO'];

const TypingGame = ({ onComplete, difficulty = 'medium' }) => {
  const [gameState, setGameState] = useState('ready'); // 'ready', 'playing', 'ended'
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [currentWord, setCurrentWord] = useState('');
  const [typedLetters, setTypedLetters] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [particles, setParticles] = useState([]);
  const [combo, setCombo] = useState(0);
  const [perfectMatches, setPerfectMatches] = useState(0);

  const timerRef = useRef(null);
  const gameContainerRef = useRef(null);

  // Difficulty settings
  const difficultySettings = {
    easy: { time: 60, revealPercent: 0.6, wordsForGold: 15, wordsForSilver: 10 },
    medium: { time: 45, revealPercent: 0.4, wordsForGold: 20, wordsForSilver: 15 },
    hard: { time: 30, revealPercent: 0.3, wordsForGold: 25, wordsForSilver: 20 }
  };

  const settings = difficultySettings[difficulty];

  // Get random word
  const getRandomWord = useCallback(() => {
    return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
  }, []);

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(settings.time);
    setTypedLetters([]);
    setCombo(0);
    setPerfectMatches(0);
    setCurrentWord(getRandomWord());
  }, [getRandomWord, settings.time]);

  // Next word
  const nextWord = useCallback(() => {
    setCurrentWord(getRandomWord());
    setTypedLetters([]);
    setScore(prev => prev + 1);
    setCombo(prev => prev + 1);

    // Create success particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.3
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
  }, [getRandomWord]);

  // Handle keyboard input
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleKeyPress = (e) => {
      const key = e.key.toUpperCase();

      // Only accept letter keys
      if (key.length !== 1 || !/[A-Z]/.test(key)) return;

      const nextIndex = typedLetters.length;

      if (currentWord[nextIndex] === key) {
        const newTyped = [...typedLetters, key];
        setTypedLetters(newTyped);

        // Word completed
        if (newTyped.length === currentWord.length) {
          nextWord();

          // Perfect match bonus (no mistakes)
          if (newTyped.length === currentWord.length) {
            setPerfectMatches(prev => prev + 1);
          }
        }
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [gameState, currentWord, typedLetters, nextWord]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('ended');
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameState]);

  // Calculate revealed letters (partial word display)
  const getRevealedWord = () => {
    const revealCount = Math.ceil(currentWord.length * settings.revealPercent);
    const revealed = currentWord.slice(0, revealCount);
    const hidden = '_'.repeat(currentWord.length - revealCount);
    return revealed + hidden;
  };

  // Calculate reward tier
  const getRewardTier = () => {
    if (score >= settings.wordsForGold) return 'gold';
    if (score >= settings.wordsForSilver) return 'silver';
    return 'bronze';
  };

  // Calculate rewards
  const getRewards = () => {
    const tier = getRewardTier();
    const baseGold = { bronze: 25, silver: 50, gold: 100 };
    const baseXP = { bronze: 10, silver: 25, gold: 50 };

    return {
      gold: baseGold[tier] + (score * 2) + (perfectMatches * 5),
      xp: baseXP[tier] + score + (perfectMatches * 2),
      tier
    };
  };

  // End game and return rewards
  const endGame = () => {
    const rewards = getRewards();
    onComplete?.(rewards);
  };

  return (
    <div
      ref={gameContainerRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 overflow-hidden"
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 2px, transparent 2px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 2px, transparent 2px)
          `,
          backgroundSize: '50px 50px',
          animation: 'slideDown 20s linear infinite'
        }} />
      </div>

      {/* Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-4 h-4 bg-yellow-400 rounded-full animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: '0.6s'
          }}
        />
      ))}

      {/* Main game container */}
      <div className="relative w-full max-w-3xl p-8">
        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-4 right-4 p-3 bg-white nb-border hover:translate-y-1 transition-transform"
        >
          {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>

        {/* Game title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-black text-white nb-text-shadow mb-2">
            REED'S TYPING CHALLENGE
          </h1>
          <p className="text-2xl font-bold text-white">
            Complete the words before time runs out!
          </p>
        </div>

        {/* Ready screen */}
        {gameState === 'ready' && (
          <div className="bg-white nb-border p-12 text-center animate-fadeIn">
            <h2 className="text-4xl font-black mb-6">Ready to Type?</h2>
            <p className="text-xl mb-4">
              I'll show you part of the word...<br />
              You guess and type the rest!
            </p>
            <p className="text-lg mb-8 text-gray-600">
              ⏱️ {settings.time} seconds<br />
              🎯 {settings.wordsForGold} words for GOLD reward<br />
              🥈 {settings.wordsForSilver} words for SILVER reward
            </p>
            <button
              onClick={startGame}
              className="px-12 py-6 bg-green-500 text-white text-3xl font-black nb-border hover:translate-y-1 transition-transform"
            >
              START TYPING!
            </button>
          </div>
        )}

        {/* Playing screen */}
        {gameState === 'playing' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Score and timer */}
            <div className="flex justify-between items-center">
              <div className="bg-white nb-border px-8 py-4 flex items-center gap-4">
                <span className="text-2xl font-bold">SCORE</span>
                <span className="text-5xl font-black text-green-600">{score}</span>
              </div>

              {combo > 2 && (
                <div className="bg-yellow-400 nb-border px-6 py-3 animate-bounce">
                  <span className="text-2xl font-black">🔥 COMBO x{combo}</span>
                </div>
              )}

              <div className="bg-white nb-border px-8 py-4 flex items-center gap-4">
                <span className="text-2xl font-bold">TIME</span>
                <span className={`text-5xl font-black ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
                  {timeLeft}
                </span>
              </div>
            </div>

            {/* Word display - Partial reveal */}
            <div className="bg-white nb-border p-12">
              <p className="text-center text-lg font-bold text-gray-600 mb-4">
                HINT: {getRevealedWord()}
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                {currentWord.split('').map((letter, index) => {
                  const isTyped = index < typedLetters.length;
                  const isCorrect = isTyped && typedLetters[index] === letter;

                  return (
                    <div
                      key={index}
                      className={`
                        w-16 h-20 flex items-center justify-center text-4xl font-black nb-border
                        transition-all duration-200
                        ${isCorrect ? 'bg-green-400 scale-110' : 'bg-gray-100'}
                        ${index === typedLetters.length ? 'ring-4 ring-blue-500 animate-pulse' : ''}
                      `}
                    >
                      {isTyped ? letter : ''}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-gray-200 nb-border h-8 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 transition-all duration-300"
                style={{ width: `${(score / settings.wordsForGold) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Ended screen */}
        {gameState === 'ended' && (
          <div className="bg-white nb-border p-12 text-center animate-fadeIn">
            <h2 className="text-5xl font-black mb-6">
              {getRewardTier() === 'gold' ? '🏆 AMAZING!' :
               getRewardTier() === 'silver' ? '🥈 GREAT JOB!' :
               '🥉 NICE TRY!'}
            </h2>

            <div className="text-7xl font-black text-green-600 mb-8">
              {score} WORDS
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-yellow-100 nb-border p-6">
                <p className="text-lg font-bold text-gray-600">GOLD EARNED</p>
                <p className="text-4xl font-black text-yellow-600">
                  +{getRewards().gold}
                </p>
              </div>
              <div className="bg-blue-100 nb-border p-6">
                <p className="text-lg font-bold text-gray-600">XP EARNED</p>
                <p className="text-4xl font-black text-blue-600">
                  +{getRewards().xp}
                </p>
              </div>
            </div>

            {perfectMatches > 0 && (
              <div className="bg-purple-100 nb-border p-4 mb-6">
                <p className="text-xl font-black">
                  ⚡ {perfectMatches} PERFECT {perfectMatches === 1 ? 'MATCH' : 'MATCHES'}!
                </p>
              </div>
            )}

            <button
              onClick={endGame}
              className="px-12 py-6 bg-green-500 text-white text-3xl font-black nb-border hover:translate-y-1 transition-transform"
            >
              COLLECT REWARDS
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(50px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .nb-text-shadow {
          text-shadow: 4px 4px 0 rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default TypingGame;
