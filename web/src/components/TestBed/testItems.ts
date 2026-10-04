
type EventProps = {
  action: string;
  data?: unknown;
}


export type TestItemProps = {
  index: string; 
  active: boolean;
  label: string;
  description: string;
  onEnable: EventProps;
  onDisable: EventProps;
  toggleActive: () => void;
  icon: string;
}

export const defaultTestItems = [
  {
    index: 'contextMenus',
    active: false,
    label: 'Context Menus',
    description: 'These are the generic context menus',
    icon: 'fa fa-bars',
    onEnable: {
      action:'OPEN_CONTEXT',
      data: {
        title:'LSX ASSETS',
        description:'A test menu',
        icon:'cube',
        canClose:true,
        menu:'main',
        searchBar:true,
        clickSounds:true,
        hoverSounds:true,

        options:[
          {
            title:'Browse assets',
            icon:'search',
            readOnly:true,
          },
          {
            title:'Los Santos County Jail',
            icon:'building',
            description:'A row with a description under its title',
          },
          {
            title:'Disabled option',
            icon:'lock',
            description:'Rows can be shown but not picked',
            disabled:true,
          },
          {
            title:'Open a submenu',
            icon:'folder-open',
            arrow:true,
            description:'An arrow means the row leads somewhere'
          },
          {
            title:'Settings',
            icon:'sliders',
            description:'Opens nothing in this test menu'
          },
        ]
      }
    },
    onDisable: {action: 'CLOSE_CONTEXT'}
  },
  {
    index: 'statusInfo',
    active: false,
    label: 'Status Info',
    description: 'Used for keeping track of a players tasks',
    icon: 'fa fa-info',
    onEnable: {
      action: 'ADD_STATUS',
      data: {
        id: '1',
        title: 'Sanitation Job',
        description: 'Please collect all the trash from the streets marked on your map before the time runs out.',     
        icon: 'dumpster',
        progress: 50,
        time: 120,
      }
    },
    onDisable: {
      action: 'REMOVE_STATUS',
      data: '1'
    }
  },
  {
    index: 'showTextUI',
    active: false,
    label: 'Show Text UI',
    description: 'Used for showing a text UI',
    icon: 'fa fa-font',
    onEnable: {
      action: 'SHOW_TEXT_UI',
      data: {
        text: 'Press E to interact with the object',
      }
    },
    onDisable: {
      action: 'HIDE_TEXT_UI',
    }
  },
  {
    index: 'notification',
    active: false,
    label: 'Test Notification',
    description: 'Used for showing a notification',
    icon: 'fa fa-bell',
    onEnable: {
      action: 'ADD_NOTIFICATION',
      data: {
        id: '1',
        duration: 600000,
        iconColor: 'rgba(255, 0, 0, 0.5)',
        iconBg: 'rgba(255, 0, 0, 0.1)',
        title: 'Test Notification',
        description: 'Get yourself over to the Los Santos Customs and get your car fixed up. You can also get a new paint job while you are there.',
        position: 'top-center',
        icon: 'bell',
      },
    },
    onDisable: {
      
      action: 'HIDE_TEXT_UI',
    }
  },
  {
    index: 'progressBar',
    active: false,
    label: 'Progress Bar',
    description: 'Used for showing a progress bar',
    icon: 'fa fa-tasks',
    onEnable: {
      action : 'SHOW_PROGRESS',
      data : {
        position: 'top-center',
        icon: 'fa fa-bars',
        description: 'This is a progress bar',
        label: 'Progress',
        duration: 25000
      }
    },
    onDisable: {
      action: 'CANCEL_PROGRESS',
    }
  },
  {
    index: 'keyInputs',
    active: false,
    label: 'Key Inputs',
    description: 'Used for showing key inputs',
    icon: 'fa fa-keyboard',
    onEnable: {
      action: 'SET_KEY_INPUTS',
      data: {
        direction: 'row',
        inputs: [
          
          { qwerty: 'G', label: 'Open Menu', icon: 'fa fa-bars', delay: 1000 },
          { qwerty: 'Arrow Right', label: 'Open Menu', icon: 'fa fa-bars', delay: 1000 },
        ],
  
        position: 'bottom-center'
      }
    },
    onDisable: {
      action: 'HIDE_KEY_INPUTS',
    }
  },
  {
    index: 'dialog',
    active: false,
    label: 'NPC Dialogue',
    description: 'Used for showing NPC dialogue',
    icon: 'fa fa-user-tie',
    onEnable: {
      action: "DIALOG_STATE",
      data: {
        dialog       : "Is there anything I can do to postpone this?",
        id           : "my_dialogue",
        title        : "Officer",
        icon         : "fa-user-tie",
        prevDialog   : 'main',
        audioFile    : "audio.mp3",
  
        metadata    : [
          {
            icon : "fa-user-tie",
            label : "Officer",
            data  : "Grade 4",
            progress : 0,
          },
          {
            icon : "fa-user-tie",
            label : "Officer",
            data  : "Grade 4",
            progress : 75,
          },
          {
            icon : "fa-user-tie",
            label : "Officer",
            data  : "Grade 4",
          },
        ],
  
  
        responses : [
          {
            label     : "Yes",
            icon      : "fa-user-tie",
            description : "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s when an unknown printer took a galley of type and scrambled it to make a type specimen book.",  
            dontClose : true,
            disabled:true, 
            actionid : "111",
            colorScheme: "#ff0000"
          },
          {
            label     : "No",
            icon      : "fa-user-tie",
            dontClose : true,
            actionid : "222"
          },
          {
            label     : "Maybe So",
            icon      : "fa-user-tie",
            dontClose : true,
            actionid : "333"
          },
          {
            label     : "Yesd",
            icon      : "fa-user-tie",
            // description : "This is a description",
            dontClose : true,
            actionid : "444"
          },
          {
            label     : "No",
            icon      : "fa-user-tie",
            dontClose : true,
            actionid : "555"
          },
          {
            label     : "Maybe So",
            icon      : "fa-user-tie",
            dontClose : true,
            actionid : "666"
          },
        ]
      }
    },
    onDisable: {
      action: 'DIALOG_STATE',
    }
  },
  {
    index: 'dialogue_cards',
    active: false,
    label: 'NPC Dialogue — offers',
    description: 'Replies drawn as cards: a picture, a name, a place and a figure',
    icon: 'fa fa-id-card',
    onEnable: {
      action: 'DIALOG_STATE',
      data: {
        id       : 'leasing',
        title    : 'Leasing agent',
        subtitle : 'Mirror Park',
        dialog   : "Three places came free this week. Pick one and I'll get the keys.",

        skill : {
          label: 'Standing', level: 4, progress: 62,
          xp: 1840, nextLevelXp: 2600, xpToNext: 760,
          rankLabel: 'Regular',
        },

        metadata : [
          { label: 'Leases', value: 'Warehouses, storefronts' },
          { label: 'Deposit', value: 'One month up front', emphasis: true },
        ],

        responses : [
          {
            index: 1, label: 'Warehouse', sub: 'Cypress Flats', value: '$4,200',
            badge: 'Busy area', badgeTone: 'warn',
            // Deliberately a URL that does not resolve, so the fallback is
            // what this fixture actually proves.
            image: 'nui://lsx_lib/web/build/missing.png',
            imageFallback: 'data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 170 62%22%3E%3Cpath fill=%22%23fff%22 fill-opacity=%220.92%22 fill-rule=%22evenodd%22 d=%22M14 54 L14 24 L52 10 L118 10 L156 24 L156 54 Z M30 54 L30 34 L58 34 L58 54 Z M70 30 L100 30 L100 40 L70 40 Z M112 54 L112 34 L140 34 L140 54 Z%22/%3E%3C/svg%3E',
            dontClose: true,
          },
          {
            index: 2, label: 'Storefront', sub: 'Vinewood', value: '$2,800',
            badge: 'Quiet', badgeTone: 'ok',
            image: 'data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 170 62%22%3E%3Cpath fill=%22%23fff%22 fill-opacity=%220.92%22 fill-rule=%22evenodd%22 d=%22M20 54 L20 20 L150 20 L150 54 Z M28 28 L28 42 L72 42 L72 28 Z M98 28 L98 42 L142 42 L142 28 Z M78 54 L78 30 L92 30 L92 54 Z M14 20 L28 8 L142 8 L156 20 Z%22/%3E%3C/svg%3E',
            dontClose: true,
          },
          {
            index: 3, label: 'Office floor', sub: 'Pillbox Hill', value: '$6,500',
            badge: 'Taken soon', badgeTone: 'bad',
            image: 'data:image/svg+xml;utf8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 170 62%22%3E%3Cpath fill=%22%23fff%22 fill-opacity=%220.92%22 fill-rule=%22evenodd%22 d=%22M58 56 L58 6 L112 6 L112 56 Z M66 14 L66 20 L76 20 L76 14 Z M94 14 L94 20 L104 20 L104 14 Z M66 28 L66 34 L76 34 L76 28 Z M94 28 L94 34 L104 34 L104 34 Z M78 56 L78 42 L92 42 L92 56 Z%22/%3E%3C/svg%3E',
            dontClose: true,
          },
          { index: 4, label: 'Nothing today', pin: true },
        ],
      }
    },
    onDisable: {
      action: 'DIALOG_STATE',
    }
  },
  {
    index: 'keycode',
    active: false,
    label: 'Keycode',
    description: 'Numeric keypad challenge — open with a target code, locks on correct entry',
    icon: 'fa fa-keyboard',
    onEnable: {
      action: 'OPEN_KEYCODE',
      data: {
        code: '1234',
        title: 'Security Panel',
        description: 'Enter the 4-digit override code',
        multipleTries: true,
        allowCancel: true,
        length: 4,
      },
    },
    onDisable: {
      action: 'CLOSE_KEYCODE',
    },
  },
  {
    index: 'inputMenus',
    active: false,
    label: 'Input Menus',
    description: 'Used for having the player fill out a form',
    icon: 'fa fa-file-alt',
    onEnable: {
      action: 'OPEN_INPUT_DIALOG',
      data: {
        inputs: [
          'Username',
          'Password',
          {icon:'user', type: 'checkbox', label: 'Remember Me', description: 'Check this box to remember your login information', checked: true},
          // {type: 'slider', label: 'Volume', description: 'Adjust the volume of the game', min: 0, max: 100, default: 50},
          // {type: 'date', label: 'Date of Birth', description: 'Enter your date of birth', default: true, format: 'MM/DD/YYYY', returnString: true, clearable: true},
          // {type: 'color', label: 'Primary Color', description: 'Select your primary color', default: '#48E287', format: 'hex'},
          // {type: 'select', label: 'Language', description: 'Select your preferred language', options: [{value: 'en', label: 'English'}, {value: 'es', label: 'Spanish'}, {value: 'fr', label: 'French'}], placeholder: 'Select a language', required: true},
          // {type: 'multi-select', label: 'Favourite Foods', description: 'Select your favourite foods', options: [{value: 'pizza', label: 'Pizza'}, {value: 'burger', label: 'Burger'}, {value: 'pasta', label: 'Pasta'}, {value: 'salad', label: 'Salad'}], placeholder: 'Select your favourite foods', required: true, clearable: true, maxSelectedValues: 2},
          // {type: 'textarea', label: 'Bio', description: 'Enter a short bio about yourself', placeholder: 'Enter your bio here', required: true, autosize: false},
          // {type: 'time', label: 'Time', description: 'Select the time', default: '12:00', format: '12', clearable: true},
          // {type: 'date-range', label: 'Date Range', description: 'Select a date range', default: ['01/01/2022', '01/02/2022'], format: 'MM/DD/YYYY', returnString: true, clearable: true},
          // {type: 'number', label: 'Age', description: 'Enter your age', placeholder: 'Enter your age', required: true, min: 18, max: 100, default: 18, precision: 0, step: 1},
          // {type: 'input', label: 'Email', description: 'Enter your email address', placeholder: 'Enter your email address', required: true},
        
        ],
        info: {
          title: 'Login',
          description: 'Enter your login information below',
          icon: 'user',
          backButton: 'menu_to_return_to',
          allowCancel: true,
        }
      }
    },
    onDisable: {
      action: 'CLOSE_INPUT_DIALOG',
    }
  },
] as TestItemProps[]  