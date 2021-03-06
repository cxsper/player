
/**
	* Наш собственный модуль обработки распознавания речи.
	* @class Recognee
 */
var Recognee;

Recognee = function(language, continuous) {
  var EGHV, control, handle, makeContinuous, recognition, setGrammar, setLanguage, setRecognition;
  if (language == null) {
    language = 'ru-RU';
  }
  if (continuous == null) {
    continuous = true;
  }

  /**
  		* Свойство, определяющее язык распознавания.
  		* @memberof Recognee
  		* @type {string}
   */
  this.language = language;

  /**
  		* Свойство, определяющее непрерывность распознавания.
  		* @memberof Recognee
  		* @type {bool}
   */
  this.continuous = continuous;

  /**
  		* Приватный объект для хранения событий, грамматики, функий-коллбеков и валидаций.
  		* @memberof Recognee
  		* @type {object}
   */
  EGHV = {};

  /**
  		* Приватный объект распознавания речи Web Speech API.
  		* @memberof Recognee
  		* @type {object}
   */
  recognition = null;

  /**
  		* Вспомагательная функция для определения состояния плеера.
  		* @memberof Recognee
  		* @returns {bool} Играет ли плеер.
   */
  this.paused = function() {
    return recognition.paused;
  };

  /**
  		* Приватная функция для задания объекта распознавания речи в зависимости от браузера и движка.
  		* @memberof Recognee
   */
  setRecognition = function() {
    var SpeechRecognition, SpeechRecognitionEvent;
    SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
    SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;
    return recognition = new SpeechRecognition;
  };

  /**
  		* Приватная функция для задания языка распознавания речи объекту распознавания.
  		* @memberof Recognee
   */
  setLanguage = function(_this) {
    return recognition.lang = _this.language;
  };

  /**
  		* Приватная функция для задания грамматического словаря для объекта распознавания.
  		* @memberof Recognee
   */
  setGrammar = function() {
    var SpeechGrammarList, event, grammar, speechList, words;
    SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
    words = [];
    for (event in EGHV) {
      EGHV[event].grammar.forEach(function(word) {
        return words.push(word);
      });
    }
    speechList = new SpeechGrammarList;
    grammar = '#JSGF V1.0; grammar playercontrols; public <player> = ' + words.join(' | ') + ' ;';
    speechList.addFromString(grammar);
    return recognition.grammars = speechList;
  };

  /**
  		* Приватная функция для иммитации непрерывности распознавания.
  		* @memberof Recognee
   */
  makeContinuous = function(_this) {
    _this.continuous = true;
    return recognition.addEventListener("end", function() {
      if (_this.continuous) {
        return recognition.start();
      }
    });
  };

  /**
  		* Публичная функция для взаимодействия с модулем снаружи.
  		* Служит для обеспчения возможности прицепления любых функций с любыми валидациями
  		* на любые распознанные слова.
  		* @param {string} event - Имя события.
  		* @param {mixed} grammar - Массив с грамматикой.
  		* @param {mixed} handler - Функция-обработчик события.
  		* @param {mixed} validation - Функция-валидация в обработчике.
  		* @memberof Recognee
   */
  this.listen = function(event, grammar, handler, validation) {
    if (validation == null) {
      validation = void 0;
    }
    return EGHV[event] = {
      grammar: grammar,
      handler: handler,
      validation: validation
    };
  };

  /**
  		* Приватная функция для обработки публичного прицепления события на распознавание.
  		* @param {string} event - Имя события.
  		* @param {mixed} grammar - Массив с грамматикой.
  		* @param {mixed} handler - Функция-обработчик события.
  		* @param {mixed} validations - Функция-валидация в обработчике.
  		* @param {object} recognized - Объект с распознанными словами.
  		* @memberof Recognee
   */
  control = function(event, grammar, handler, recognized, validations) {
    var result;
    if (validations == null) {
      validations = void 0;
    }
    result = recognized.results[0][0].transcript.toLowerCase();
    if (!validations) {
      return grammar.forEach(function(word) {
        if (result.indexOf(word) !== -1) {
          return handler();
        }
      });
    } else {
      if (validations && validations()) {
        return grammar.forEach(function(word) {
          if (result.indexOf(word) !== -1) {
            return handler();
          }
        });
      }
    }
  };

  /**
  		* Приватная функция для прицепления обработчика распознавания на событие распознавание речи.
  		* @memberof Recognee
   */
  handle = function() {
    return recognition.addEventListener("result", function(recognized) {
      var event, results;
      console.log(recognized.results[0][0].transcript.toLowerCase());
      results = [];
      for (event in EGHV) {
        results.push(control(event, EGHV[event].grammar, EGHV[event].handler, recognized, EGHV[event].validation));
      }
      return results;
    });
  };

  /**
  		* Публичная функция старта распознавания речи.
  		* @memberof Recognee
   */
  this.recognize = function() {
    setRecognition();
    setLanguage(this);
    setGrammar();
    makeContinuous(this);
    handle();
    return recognition.start();
  };

  /**
  		* Публичная функция остановки распознавания речи.
  		* @memberof Recognee
   */
  this.stop = (function(_this) {
    return function() {
      _this.continuous = false;
      return recognition.stop();
    };
  })(this);
  return this;
};


/**
	* Наш собственный модуль обработки динамических переходов в UI приложения.
	* @param {object} root - Элемент-родитель, обслуживающий переходы.
	* @class Passage
 */
var Passage, passage;

Passage = function(root) {
  if (root == null) {
    root = document.body;
  }

  /**
  		* Функция для очистки всех эффектов с корневого элемента.
  		* @memberof Passage
   */
  this.clear = function() {
    return root.classList = '';
  };

  /**
  		* Функция для осуществления перехода в UI.
  		* @param {mixed} along - Массив CSS классов, которые следует добавить корневому элементу.
  		* @param {mixed} without - Массив CSS классов, которые следует убрать из корневого элемента.
  		* @param {integer} time - Время, через которое необходимо это сделать.
  		* @param {mixed} cb - Функция-коллбек
  		* @memberof Passage
   */
  this.pass = function(along, without, time, cb) {
    if (without == null) {
      without = [];
    }
    if (time == null) {
      time = 0;
    }
    if (time !== 0) {
      return setTimeout(function() {
        along.forEach(function(className) {
          return root.classList.add(className);
        });
        without.forEach(function(className) {
          return root.classList.remove(className);
        });
        if (cb) {
          return cb();
        }
      }, time);
    } else {
      along.forEach(function(className) {
        return root.classList.add(className);
      });
      without.forEach(function(className) {
        return root.classList.remove(className);
      });
      if (cb) {
        return cb();
      }
    }
  };
  return this;
};


/**
	* Глобальный объект модуля переходов в UI.
	* @type {object}
 */

passage = new Passage;


/**
	* Глобальный объект для взаимодействия с каркасом Vue.js.
	* Служит для установления типа подключения видео и для установления самого источника.
	* @property {string} type - Тип подключения видео.
	* @property {string} source - Единый идентификатор ресурса.
 */
var data;

data = {
  type: null,
  source: null
};


/**
    * Глобальный объект словаря для плеера.
    * @type {object}
 */
var vocabulary;

vocabulary = {
  play: ["играть"],
  stop: ["стоп"],
  louder: ["громче"],
  quiter: ["тише"],
  mute: ["звук"],
  slower: ["медленнее"],
  faster: ["быстрее"]
};


/**
    * Глобальная переменная, определяющая язык плеера.
    * @type {string}
 */
var lang, languages;

lang = 'ru-RU';


/**
    * Глобальный массив всех языков.
    * @type {mixed}
 */

languages = {
  "Afrikaans": 'af',
  "Basque": 'eu',
  "Bulgarian": 'bg',
  "Catalan": 'ca',
  "Arabic (Egypt)": 'ar-EG',
  "Arabic (Jordan)": 'ar-JO',
  "Arabic (Kuwait)": 'ar-KW',
  "Arabic (Lebanon)": 'ar-LB',
  "Arabic (Qatar)": 'ar-QA',
  "Arabic (UAE)": 'ar-AE',
  "Arabic (Morocco)": 'ar-MA',
  "Arabic (Iraq)": 'ar-IQ',
  "Arabic (Algeria)": 'ar-DZ',
  "Arabic (Bahrain)": 'ar-BH',
  "Arabic (Lybia)": 'ar-LY',
  "Arabic (Oman)": 'ar-OM',
  "Arabic (Saudi Arabia)": 'ar-SA',
  "Arabic (Tunisia)": 'ar-TN',
  "Arabic (Yemen)": 'ar-YE',
  "Czech": 'cs',
  "Dutch": 'nl-NL',
  "English (Australia)": 'en-AU',
  "English (Canada)": 'en-CA',
  "English (India)": 'en-IN',
  "English (New Zealand)": 'en-NZ',
  "English (South Africa)": 'en-ZA',
  "English (UK)": 'en-GB',
  "English (US)": 'en-US',
  "Finnish": 'fi',
  "French": 'fr-FR',
  "Galician": 'gl',
  "German": 'de-DE',
  "Hebrew": 'he',
  "Hungarian": 'hu',
  "Icelandic": 'is',
  "Italian": 'it-IT',
  "Indonesian": 'id',
  "Japanese": 'ja',
  "Korean": 'ko',
  "Latin": 'la',
  "Mandarin Chinese": 'zh-CN',
  "Traditional Taiwan": 'zh-TW',
  "Simplified China": 'zh-CN',
  "Simplified Hong Kong": 'zh-HK',
  "Yue Chinese (Traditional Hong Kong)": 'zh-yue',
  "Malaysian": 'ms-MY',
  "Norwegian": 'no-NO',
  "Polish": 'pl',
  "Pig Latin": 'xx-piglatin',
  "Portuguese": 'pt-PT',
  "Portuguese (Brasil)": 'pt-BR',
  "Romanian": 'ro-RO',
  "Russian": 'ru-RU',
  "Serbian": 'sr-SP',
  "Slovak": 'sk',
  "Spanish (Argentina)": 'es-AR',
  "Spanish (Bolivia)": 'es-BO',
  "Spanish (Chile)": 'es-CL',
  "Spanish (Colombia)": 'es-CO',
  "Spanish (Costa Rica)": 'es-CR',
  "Spanish (Domican Republic)": 'es-DO',
  "Spanish (Ecuador)": 'es-EC',
  "Spanish (El Salvador)": 'es-SV',
  "Spanish (Guatemala)": 'es-GT',
  "Spanish (Honduras)": 'es-HN',
  "Spanish (Mexico)": 'es-MX',
  "Spanish (Nicaragua)": 'es-NI',
  "Spanish (Panama)": 'es-PA',
  "Spanish (Paraguay)": 'es-PY',
  "Spanish (Peru)": 'es-PE',
  "Spanish (Puerto Rico)": 'es-PR',
  "Spanish (Spain)": 'es-ES',
  "Spanish (US)": ' es-US',
  "Spanish (Uruguay)": 'es-UY',
  "Spanish (Venezuela)": 'es-VE',
  "Swedish": 'sv-SE',
  "Turkish": 'tr',
  "Zulu": 'zu'
};


/**
	* Vue.js компонент, отвечающий за приветственную анимацию.
	* @namespace welcome
 */
var welcome;

welcome = Vue.component('welcome', {

  /**
  		* HTML-шаблон компонента.
  		* @type {string}
  		* @memberof welcome
   */
  template: '#welcome-template',

  /**
  		* Функция, которая вызывается при создании Vue.js компонента.
  		* @type {function}
  		* @memberof welcome
   */
  mounted: function() {
    var _this;
    _this = this;
    passage.pass(['no-overflow', 'transition']);
    return passage.pass(['body-color'], [], 8000, function() {
      return _this.$emit('finalize');
    });
  }
});


/**
	* Vue.js компонент, отвечающий за загрузку перед показом плеера.
	* @namespace loading
 */
var loading;

loading = Vue.component('loading', {

  /**
  		* HTML-шаблон компонента.
  		* @type {string}
  		* @memberof loading
   */
  template: '#loading-template',

  /**
  		* Функция, которая вызывается при создании Vue.js компонента.
  		* @type {function}
  		* @memberof loading
   */
  mounted: function() {
    var _this;
    _this = this;
    passage.clear();
    passage.pass(['loading', 'loading-background']);
    passage.pass(['invisible'], [], 5000, (function(_this) {
      return function() {
        return _this.$emit('finalize');
      };
    })(this));
    return passage.pass([], ['loading-background', 'loading'], 6000);
  }
});


/**
	* Vue.js компонент, отвечающий за сам плеер.
	* @namespace player
 */
var player;

player = Vue.component('player', {

  /**
  		* HTML-шаблон компонента.
  		* @type {string}
  		* @memberof player
   */
  template: '#player-template',

  /**
  		* Функция, которая вызывается при создании Vue.js компонента.
  		* @type {function}
  		* @memberof player
   */
  mounted: function() {
    passage.clear();
    passage.pass(['transition'], [], 0, (function(_this) {
      return function() {
        return _this.$emit('start');
      };
    })(this));
    return passage.pass(['cloud-bg'], [], 300);
  },

  /**
  		* Функция, служащая объектом свойств компонента Vue.js
  		* @memberof player
  		* @returns {object} Объект с данными компонента (источник видео)
   */
  data: function() {
    return {
      source: data.source,
      settings: false
    };
  },

  /**
  		* Методы компонента.
  		* @memberof player
  		* @namespace player.methods
   */
  methods: {

    /**
    			* Метод показа / скрывания живых настроек.
    			* @memberof player.methods
     */
    toggleSettings: function() {
      return this.settings = !this.settings;
    }
  }
});


/**
	* Vue.js компонент, отвечающий за загрузку видео.
	* @namespace upload
 */
var upload;

upload = Vue.component('upload', {

  /**
  		* HTML-шаблон компонента.
  		* @type {string}
  		* @memberof upload
   */
  template: '#input-template',

  /**
  		* Функция, которая вызывается при создании Vue.js компонента.
  		* @type {function}
  		* @memberof upload
   */
  mounted: function() {
    passage.clear();
    return passage.pass(['transparent'], [], 0);
  },

  /**
  		* Функция, служащая объектом свойств компонента Vue.js
  		* @memberof upload
  		* @returns {object} Объект с данными компонента (вид подключения видео).
   */
  data: function() {
    return {
      type: data.type
    };
  },

  /**
  		* Методы компонента.
  		* @memberof upload
  		* @namespace upload.methods
   */
  methods: {

    /**
    			* Метод, проверяющий совпадение расширения файла.
    			* @memberof upload.methods
    			* @returns {bool} Совпало ли расширение файла.
     */
    checkExtension: function(upload, exts) {
      var fileName;
      fileName = document.getElementById(upload).value.trim();
      return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
    },

    /**
    			* Метод, составляющий объектный единый указатель ресурса.
    			* @memberof upload.methods
     */
    buildSource: function() {
      var extensions, input;
      extensions = ['ogv', 'mp4', 'webm'];
      if (!this.checkExtension('upload', extensions)) {
        alert('Неподдерживаемое расширение файла. Поддерживаемые расширения: ' + extensions.join(" "));
        document.getElementById('upload').value = "";
        return false;
      }
      input = document.querySelector('input');
      if (data.type === 'link') {
        data.source = input.value.trim();
      } else {
        data.source = URL.createObjectURL(input.files[0]);
      }
      return passage.pass(['invisible'], [], 0, (function(_this) {
        return function() {
          return _this.$emit('finalize');
        };
      })(this));
    }
  }
});


/**
	* Vue.js компонент, отвечающий за выбор метода подключения видео.
	* @namespace source
 */
var src;

src = Vue.component('src', {

  /**
  		* HTML-шаблон компонента.
  		* @type {string}
  		* @memberof source
   */
  template: '#src-template',

  /**
  		* Функция, которая вызывается при создании Vue.js компонента.
  		* @type {function}
  		* @memberof source
   */
  mounted: function() {
    var ghost;
    ghost = document.querySelectorAll('button')[1];
    passage.clear();
    return passage.pass(['cinema', 'half-visible'], ['invisible'], 100, (function(_this) {
      return function() {
        return ghost.classList.add('moveButton');
      };
    })(this));
  },

  /**
  		* Методы компонента.
  		* @memberof source
  		* @namespace source.methods
   */
  methods: {

    /**
    			* Метод выбора типа подключения видео.
    			* @memberof source.methods
     */
    setType: function(type) {
      data.type = type;
      return passage.pass(['invisible'], ['half-visible'], 0, (function(_this) {
        return function() {
          return _this.$emit('finalize');
        };
      })(this));
    }
  }
});


/**
	* Vue.js компонент, отвечающий за настройку слов-команд и языка распознавания речи.
	* @namespace controls
 */
var controls;

controls = Vue.component('controls', {

  /**
  		* HTML шаблон компонента.
  		* @type {string}
  		* @memberof controls
   */
  template: '#controls-template',

  /**
  		* Функция, которая вызывается при создании Vue.js компонента.
  		* @type {function}
  		* @memberof controls
   */
  mounted: function() {
    $('.selectpicker').selectpicker();
    if (this.accept !== 'live') {
      passage.clear();
      return passage.pass(['magic', 'half-visible']);
    }
  },

  /**
  		* Методы компонента.
  		* @memberof controls
  		* @namespace controls.methods
   */
  methods: {

    /**
    			* Проверка на пустоту формы со словами.
    			* @memberof controls.methods
     */
    checkValidity: function() {
      var f;
      f = document.getElementsByTagName('form')[0];
      if (f.checkValidity()) {
        return true;
      } else {
        alert("Все поля обязательны к заполнению!");
      }
      return false;
    },

    /**
    			* Функция сбора информации со всех полей формы.
    			* @memberof controls.methods
    			* @param {object} event - Обработчик события клика.
     */
    gather: function(event) {
      var _this, ary, select;
      event.preventDefault();
      if (!this.checkValidity()) {
        return false;
      }
      ary = this.$el.querySelectorAll('input');
      _this = this;
      Array.prototype.forEach.call(ary, function(e) {
        if (e.classList.contains("control")) {
          return _this.inputs[e.name] = [e.value];
        }
      });
      select = this.$el.querySelector('select');
      window.lang = this.languages[select.value];
      this.lang = this.languages[select.value];
      if (this.accept !== 'live') {
        return this.$emit('finalize');
      } else {
        return this.$parent.$emit('restart');
      }
    }
  },

  /**
  		* Функция, служащая объектом свойств компонента Vue.js
  		* @memberof controls
  		* @returns {object} Объект с данными компонента (словарь, языки и т.д.)
   */
  data: function() {
    return {
      inputs: vocabulary,
      languages: languages,
      lang: lang,
      aliases: {
        play: "Играть",
        stop: "Стоп",
        louder: "Громче",
        quiter: "Тише",
        mute: "Убрать / Вернуть звук",
        slower: "Медленнее",
        faster: "Быстрее"
      }
    };
  },

  /**
  		* Массив переданных свойств в сам компонент.
  		* @memberof controls
  		* @type {mixed}
   */
  props: ['accept']
});


/**
	* Vue.js инстанс. Точка входа во Vue.js программу, точка сбора всех компонентов.
	* @namespace app
 */
var app;

app = new Vue({

  /**
  		* HTML элемент, к которому прикреплён инстанс.
  		* @type {string}
  		* @memberof app
   */
  el: "#app",

  /**
  		* Объект с данными Vue.js инстанса.
  		* @property {mixed} chain - Цепь-последовательность подгрузки компонент Vue.js.
  		* @property {integer} level - Текущий шаг приложения.
  		* @property {object} currentComponent - Текущий динамический компонент Vue.js.
  		* @memberof app
   */
  data: {
    chain: [welcome, src, upload, controls, loading, player],
    level: 0,
    currentComponent: null
  },

  /**
  		* Объект с регистрацией компонентов Vue.js.
  		* @type {object}
  		* @memberof app
   */
  components: {
    welcome: welcome,
    player: player,
    upload: upload,
    src: src,
    controls: controls,
    loading: loading
  },

  /**
  		* Методы Vue.js инстанса.
  		* @namespace app.methods
  		* @memberof app
   */
  methods: {

    /**
    			* Функция старта динамической подгрузки Vue.js компонентов, указанных в chain.
    			* @memberof app.methods
     */
    start: function() {
      return this.currentComponent = this.chain[0];
    },

    /**
    			* Функция переключения динамического компонента Vue.js на следующий в chain.
    			* @memberof app.methods
     */
    next: function() {
      this.level++;
      if (this.chain[this.level]) {
        return this.currentComponent = this.chain[this.level];
      }
    },

    /**
    			* Функция начала распознавания речи, используемая наш модуль Recognee.
    			* @memberof app.methods
     */
    startRecognition: function() {
      recognizer.language = lang;
      return recognizer.start(vocabulary);
    },

    /**
    			* Функция перезапуска распознавания речи для обновления настроек команд или языка.
    			* @memberof app.methods
     */
    restartRecognition: function() {
      var _this;
      recognizer.stop();
      _this = this;
      return setTimeout(function() {
        return _this.startRecognition();
      }, 200);
    }
  }
});

app.start();


/**
	* Глобальный объект, определяющий методы взаимодействия с HTML-5 Video.
	* @type {object}
 */
var API;

API = {
  element: function() {
    return document.querySelector('video');
  },
  play: function() {
    return API.element().play();
  },
  stop: function() {
    return API.element().pause();
  },
  louder: function() {
    if (API.element().volume + 0.1 <= 1) {
      return API.element().volume += 0.1;
    } else {
      return API.element().volume = 1;
    }
  },
  quiter: function() {
    if (API.element().volume - 0.1 >= 0) {
      return API.element().volume -= 0.1;
    } else {
      return API.element().volume = 0;
    }
  },
  toggleSound: function() {
    return API.element().muted = !API.element().muted;
  },
  slower: function() {
    if (API.element().playbackRate - 0.2 >= 0.5) {
      return API.element().playbackRate -= 0.2;
    } else {
      return API.element().playbackRate = 0.5;
    }
  },
  faster: function() {
    return API.element().playbackRate += 0.2;
  }
};


/**
    * Объект нашего собственного модуля обработки распознавания Recognee.
    * @type {object}
 */
var recognizer;

recognizer = new Recognee();

recognizer.start = function(vocabulary) {
  this.listen('play', vocabulary.play, API.play, function() {
    return API.element().paused;
  });
  this.listen('stop', vocabulary.stop, API.stop, function() {
    return !API.element().paused;
  });
  this.listen('louder', vocabulary.louder, API.louder, function() {
    return API.element().volume < 1;
  });
  this.listen('quiter', vocabulary.quiter, API.quiter, function() {
    return API.element().volume > 0;
  });
  this.listen('toggleSound', vocabulary.mute, API.toggleSound);
  this.listen('slower', vocabulary.slower, API.slower, function() {
    return API.element().playbackRate >= 0.6;
  });
  this.listen('faster', vocabulary.faster, API.faster);
  return this.recognize();
};
