  document.addEventListener('DOMContentLoaded', function () {
      const observer = new MutationObserver(function(mutationsList, observer) {
          for (let mutation of mutationsList) {
              if (mutation.type === 'childList') {
                  for (let i = 0; i <= 3; i++) {
                      const valueElement = document.getElementById('value' + i);
                      if (valueElement) {
                          console.log(`Element with id 'value${i}' added to the DOM.`);
                          observer.disconnect();
                          startColorChangeLogic(valueElement, i);
                      }
                  }
              }
          }
      });

      observer.observe(document.body, {
          childList: true,
          subtree: true
      });

      function startColorChangeLogic(valueElement, index) {

          function checkAndRetry() {
              const rawValue = valueElement.innerText;
              console.log(`Raw value inside <td> with id 'value${index}':`, rawValue);

              const trimmedValue = rawValue.trim();
              console.log("Trimmed value:", trimmedValue);

              const value = parseInt(trimmedValue);
              console.log("Parsed value:", value);

              if (isNaN(value)) {
                  console.error("Value inside <td> is not a valid number.");
                  setTimeout(checkAndRetry, 100);
              } else {

                  applyColorChange(valueElement, index);
              }
          }

          checkAndRetry();
      }


      function applyColorChange(valueElement, index) {

          function updateTextColor() {
              const rawValue = valueElement.innerText.trim();
              const value = parseInt(rawValue);

              if (isNaN(value)) {
                  console.error("Parsed value is not a valid number:", value);
                  return;
              }


              if (value > 100) {
                  valueElement.style.color = 'red';
                  valueElement.style.fontWeight = 'bold';
              } else if (value > 90) {
                  valueElement.style.color = 'orange';
                  valueElement.style.fontWeight = 'normal';
              } else {
                  valueElement.style.color = 'green';
                  valueElement.style.fontWeight = 'normal';
              }
          }

          setInterval(updateTextColor, 500);
      }
  });