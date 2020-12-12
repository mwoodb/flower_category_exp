/**
 * html-bkg-keyboard-response
 * Merron Woodbury
 *
 * plugin for displaying a stimulus with a background image and getting a keyboard response
 *
 *
 **/


jsPsych.plugins["html-bkg-keyboard-response"] = (function() {

    var plugin = {};
  
    jsPsych.pluginAPI.registerPreload('html-bkg-keyboard-response', 'background', 'image');
  
    plugin.info = {
      name: 'html-bkg-keyboard-response',
      description: '',
      parameters: {
        background: {
          type: jsPsych.plugins.parameterType.IMAGE,
          pretty_name: 'Background',
          default: undefined,
          description: 'The background image to be displayed'
        },
        stimulus_height: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Image height',
          default: null,
          description: 'Set the image height in pixels'
        },
        stimulus_width: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Image width',
          default: null,
          description: 'Set the image width in pixels'
        },
        background_height: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Background height',
            default: null,
            description: 'Set the background image height in pixels'
        },
        background_width: {
            type: jsPsych.plugins.parameterType.INT,
            pretty_name: 'Background width',
            default: null,
            description: 'Set the background image width in pixels'
        },
        maintain_aspect_ratio: {
          type: jsPsych.plugins.parameterType.BOOL,
          pretty_name: 'Maintain aspect ratio',
          default: true,
          description: 'Maintain the aspect ratio after setting width or height'
        },
        choices: {
          type: jsPsych.plugins.parameterType.KEYCODE,
          array: true,
          pretty_name: 'Choices',
          default: jsPsych.ALL_KEYS,
          description: 'The keys the subject is allowed to press to respond to the stimulus.'
        },
        prompt: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'Prompt',
          default: null,
          description: 'Any content here will be displayed below the stimulus.'
        },
        stimulus_duration: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Stimulus duration',
          default: null,
          description: 'How long to hide the stimulus.'
        },
        trial_duration: {
          type: jsPsych.plugins.parameterType.INT,
          pretty_name: 'Trial duration',
          default: null,
          description: 'How long to show trial before it ends.'
        },
        response_ends_trial: {
          type: jsPsych.plugins.parameterType.BOOL,
          pretty_name: 'Response ends trial',
          default: true,
          description: 'If true, trial will end when subject makes a response.'
        },
      }
    }
  
    plugin.trial = function(display_element, trial) {
  
      
      var html =  '<script type="text/javascript" src="js/paper-full.min.js"></script>\
                  <script type="text/javascript" src="js/rgb2lab.js"></script>\
                  <script type="text/paperscript" src="js/flower_generator.js" canvas="myCanvas"></script>'+
                  '<div style="position: relative; top: 0; left: 0; width: 50%; height: 50%; margin: auto;">\
                    <canvas id="myCanvas" class="stimulus" style="background: lightgray; position: absolute; left: 35%; top: 32%; z-index: 2;" width="100%" height="100%" resize="true" data-paper-scope="1"></canvas>\
                    <img src="'+trial.background+'" style="top: 0; left: 0; max-width: 100%; max-height: 100vh; position: relative; z-index: 0"></img>\
                </div>'+
                '<script type="text/javascript">\
                    window.globals = {x1:'+50+', x2:'+1+', x3:'+13+'};\
                    window.onload = function(){\
                        window.globals.drawFlower1(globals.x1,globals.x2,globals.x3);\
                    }\
                </script>';
  

      // add prompt
      if (trial.prompt !== null){
        html += trial.prompt;
      }

      // render
      display_element.innerHTML = html;
  
      // store response
      var response = {
        rt: null,
        key: null
      };
  
      // function to end trial when it is time
      var end_trial = function() {
  
        // kill any remaining setTimeout handlers
        jsPsych.pluginAPI.clearAllTimeouts();
  
        // kill keyboard listeners
        if (typeof keyboardListener !== 'undefined') {
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }
  
        // gather the data to store for the trial
        var trial_data = {
          "rt": response.rt,
          "stimulus": trial.stimulus,
          "key_press": response.key
        };
  
        // clear the display
        display_element.innerHTML = '';
  
        // move on to the next trial
        jsPsych.finishTrial(trial_data);
      };
  
      // function to handle responses by the subject
      var after_response = function(info) {
  
        // after a valid response, the stimulus will have the CSS class 'responded'
        // which can be used to provide visual feedback that a response was recorded
        display_element.querySelector('#jspych-image-bkg-keyboard-response-stimulus').className += ' responded';
  
        // only record the first response
        if (response.key == null) {
          response = info;
        }
  
        if (trial.response_ends_trial) {
          end_trial();
        }
      };
  
      // start the response listener
      if (trial.choices != jsPsych.NO_KEYS) {
        var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: 'performance',
          persist: false,
          allow_held_key: false
        });
      }
  
      // hide stimulus if stimulus_duration is set
      if (trial.stimulus_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.querySelector('#jspych-html-bkg-keyboard-response-stimulus').style.visibility = 'hidden';
        }, trial.stimulus_duration);
      }
  
      // end trial if trial_duration is set
      if (trial.trial_duration !== null) {
        jsPsych.pluginAPI.setTimeout(function() {
          end_trial();
        }, trial.trial_duration);
      }
  
    };
  
    return plugin;
  })();