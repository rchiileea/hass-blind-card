class class IkeaBlindCard extends HTMLElement {
  set hass(hass) {
    const _this = this;
    const entities = this.config.entities;
    
    //Init the card
    if (!this.card) {
      const card = document.createElement('ha-card');
      
      if (this.config.title) {
          card.header = this.config.title;
      }
    
      this.card = card;
      this.appendChild(card);
    
      let allShutters = document.createElement('div');
      allShutters.className = 'sc-shutters';
      entities.forEach(function(entity) {
        let entityId = entity;
        if (entity && entity.entity) {
            entityId = entity.entity;
        }
        
        let buttonsPosition = 'left';
        if (entity && entity.buttons_position) {
            buttonsPosition = entity.buttons_position.toLowerCase();
        }
        
        let titlePosition = 'top';
        if (entity && entity.title_position) {
            titlePosition = entity.title_position.toLowerCase();
        }

        let invertPercentage = false;
        if (entity && entity.invert_percentage) {
          invertPercentage = entity.invert_percentage;
        }
          
        let shutter = document.createElement('div');

        shutter.className = 'sc-shutter';
        shutter.dataset.shutter = entityId;
        shutter.innerHTML = `
          <div class="sc-shutter-top" ` + (titlePosition == 'bottom' ? 'style="display:none;"' : '') + `>
            <div class="sc-shutter-label">
            
            </div>
            <div class="sc-shutter-position">
            
            </div>
          </div>
          <div class="sc-shutter-middle" style="flex-direction: ` + (buttonsPosition == 'right' ? 'row-reverse': 'row') + `;">
            <div class="sc-shutter-buttons">
              <ha-icon-button icon="mdi:arrow-up" class="sc-shutter-button" data-command="up"></ha-icon-button><br>
              <ha-icon-button icon="mdi:stop" class="sc-shutter-button" data-command="stop"></ha-icon-button><br>
              <ha-icon-button icon="mdi:arrow-down" class="sc-shutter-button" data-command="down"></ha-icon-button>
            </div>
            <div class="sc-shutter-selector">
              <div class="sc-shutter-selector-picture">
                <div class="sc-shutter-selector-slide"></div>
                <div class="sc-shutter-selector-picker"></div>
              </div>
            </div>
          </div>
          <div class="sc-shutter-bottom" ` + (titlePosition != 'bottom' ? 'style="display:none;"' : '') + `>
            <div class="sc-shutter-label">
            
            </div>
            <div class="sc-shutter-position">
            
            </div>
          </div>
        `;
        
        let picture = shutter.querySelector('.sc-shutter-selector-picture');
        let slide = shutter.querySelector('.sc-shutter-selector-slide');
        let picker = shutter.querySelector('.sc-shutter-selector-picker');
        
        let mouseDown = function(event) {
            if (event.cancelable) {
              //Disable default drag event
              event.preventDefault();
            }
            
            _this.isUpdating = true;
            
            document.addEventListener('mousemove', mouseMove);
            document.addEventListener('touchmove', mouseMove);
            document.addEventListener('pointermove', mouseMove);
      
            document.addEventListener('mouseup', mouseUp);
            document.addEventListener('touchend', mouseUp);
            document.addEventListener('pointerup', mouseUp);
        };
  
        let mouseMove = function(event) {
          let newPosition = event.pageY - _this.getPictureTop(picture);
          _this.setPickerPosition(newPosition, picker, slide);
        };
           
        let mouseUp = function(event) {
          _this.isUpdating = false;
            
          let newPosition = event.pageY - _this.getPictureTop(picture);
          
          if (newPosition < _this.minPosition)
            newPosition = _this.minPosition;
          
          if (newPosition > _this.maxPosition)
            newPosition = _this.maxPosition;
          
          let percentagePosition = (newPosition - _this.minPosition) * 100 / (_this.maxPosition - _this.minPosition);
          
          if (invertPercentage) {
            _this.updateShutterPosition(hass, entityId, percentagePosition);
          } else {
            _this.updateShutterPosition(hass, entityId, 100 - percentagePosition);
          }
          
          document.removeEventListener('mousemove', mouseMove);
          document.removeEventListener('touchmove', mouseMove);
          document.removeEventListener('pointermove', mouseMove);
      
          document.removeEventListener('mouseup', mouseUp);
          document.removeEventListener('touchend', mouseUp);
          document.removeEventListener('pointerup', mouseUp);
        };
      
        //Manage slider update
        picker.addEventListener('mousedown', mouseDown);
        picker.addEventListener('touchstart', mouseDown);
        picker.addEventListener('pointerdown', mouseDown);
        
        //Manage click on buttons
        shutter.querySelectorAll('.sc-shutter-button').forEach(function (button) {
            button.onclick = function () {
                const command = this.dataset.command;
                
                let service = '';
                
                switch (command) {
                  case 'up':
                      service = 'open_cover';
                      break;
                      
                  case 'down':
                      service = 'close_cover';
                      break;
                
                  case 'stop':
                      service = 'stop_cover';
                      break;
                }
                
                hass.callService('cover', service, {
                  entity_id: entityId
                });
            };
        });
      
        allShutters.appendChild(shutter);
      });
      
      
      const style = document.createElement('style');
      style.textContent = `
        .sc-shutters { padding: 16px; }
          .sc-shutter { margin-top: 1rem; overflow: hidden; }
          .sc-shutter:first-child { margin-top: 0; }
          .sc-shutter-middle { display: flex; width: 210px; margin: auto; }
            .sc-shutter-buttons { flex: 1; text-align: center; margin-top: 0.4rem; }
            .sc-shutter-selector { flex: 1; }
              .sc-shutter-selector-picture { position: relative; margin: auto; background-size: cover; min-height: 150px; max-height: 100%; width: 153px; }
                .sc-shutter-selector-picture { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJkAAACXCAYAAAAGVvnKAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyNpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDA2IDc5LjE2NDY0OCwgMjAyMS8wMS8xMi0xNTo1MjoyOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIyLjIgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjFBRTg5MDk2MjhEMjExRUNBRDkyODAyNjBGNDk1MjE4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjFBRTg5MDk3MjhEMjExRUNBRDkyODAyNjBGNDk1MjE4Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MUFFODkwOTQyOEQyMTFFQ0FEOTI4MDI2MEY0OTUyMTgiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6MUFFODkwOTUyOEQyMTFFQ0FEOTI4MDI2MEY0OTUyMTgiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7O3FF+AAAQUElEQVR42uxdTW8V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); }
              .sc-shutter-selector-slide { position: absolute; top: 19px; left: 9px; width: 88%; height: 0; }
                .sc-shutter-selector-slide { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAGCAIAAACNcmNmAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAF42lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDYgNzkuMTY0NjQ4LCAyMDIxLzAxLzEyLTE1OjUyOjI5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjIuMiAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIxLTEwLTA5VDA3OjUzOjUwKzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMS0xMC0xMFQwODo0MTo1NSswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMS0xMC0xMFQwODo0MTo1NSswMTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0YmE4MmM4Yy1kMjc2LTU3NGMtOGM2Mi0wNTdlMDNkYTMxMDciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MDA3NDU5ZjQtZGY0Mi1lZDQ4LTgxNjctOTc3MTJhNzhlMmEzIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MDA3NDU5ZjQtZGY0Mi1lZDQ4LTgxNjctOTc3MTJhNzhlMmEzIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDowMDc0NTlmNC1kZjQyLWVkNDgtODE2Ny05NzcxMmE3OGUyYTMiIHN0RXZ0OndoZW49IjIwMjEtMTAtMDlUMDc6NTM6NTArMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi4yIChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NGJhODJjOGMtZDI3Ni01NzRjLThjNjItMDU3ZTAzZGEzMTA3IiBzdEV2dDp3aGVuPSIyMDIxLTEwLTEwVDA4OjQxOjU1KzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMiAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+h/y5XgAAAB5JREFUCFtjyMvLYwIBRkZGph8/fjDx8/MzsbKyAgA7vgSC0YiBJgAAAABJRU5ErkJggg==); }
              .sc-shutter-selector-picker { position: absolute; top: 19px; left: 9px; width: 88%; cursor: pointer; height: 20px; background-repeat: no-repeat; }
                .sc-shutter-selector-picker { background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJkAAAAICAYAAADqZl1cAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAGsGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDYgNzkuMTY0NjQ4LCAyMDIxLzAxLzEyLTE1OjUyOjI5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjIuMiAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIxLTEwLTA5VDA3OjUzOjUwKzAxOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMS0xMC0xMFQwODoxNTo1OSswMTowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMS0xMC0xMFQwODoxNTo1OSswMTowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozYzU0YzQ4Yi0xMmE4LTVjNGItYjg2Yy0wYjVjMmU3MTNhMjIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6Y2I5MzRlZDAtYTAyYi00YzRiLWE4OTItZWMzNjhmMGU0ZmRlIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6Y2I5MzRlZDAtYTAyYi00YzRiLWE4OTItZWMzNjhmMGU0ZmRlIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjYjkzNGVkMC1hMDJiLTRjNGItYTg5Mi1lYzM2OGYwZTRmZGUiIHN0RXZ0OndoZW49IjIwMjEtMTAtMDlUMDc6NTM6NTArMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMi4yIChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZDk0YjI3ZGMtNDJmYy0xYTQwLWE2MGUtOTM2NjY0NWFkY2U1IiBzdEV2dDp3aGVuPSIyMDIxLTEwLTA5VDA4OjM4OjA1KzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjIuMiAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjNjNTRjNDhiLTEyYTgtNWM0Yi1iODZjLTBiNWMyZTcxM2EyMiIgc3RFdnQ6d2hlbj0iMjAyMS0xMC0xMFQwODoxNTo1OSswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIyLjIgKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PhzJucAAAAWjSURBVFiFXdhJTh1JEMbxYjIz2EZIsOhLcABuxKJ3fYO+Z/cCIWHZzGAz9PuV/EfZlJR6VZkZEV+MGfmWzs7O/lleXt7b2NiYLi8vp69fv06fPn2arq+vp7e3t3lsbm5OP3/+nFZWVib7np6epvv7+3lte3t78ry8vExLS0vzu99fv37NA+2C//Tt27dpdXV15r2+vj7PRWP++/fv0+7u7vyOjiwy9vb25u/b29vp6Ohoenx8nB4eHqbn5+eZj32wkYMWbnzx39ramt/h7Hl9fZ1HcvG+urp6p48Gf7qSReaXL19mOWijg5deaOG8ubmZ6Qx8kktndHQwhy985nz3Ti6+1tfW1mabWEfv2+9oM/5i/52dnenu7u7dpug96I+Pj2c87ILOHrzMxZed+dQ6ftY8ZJsLZ7qb+/Hjx0ybzTx44JlsNlv453p1QfxHjiAMQN8IAp0hMGB0hsCcg81bzwG+OT8wvnM4RSkQuPjgSU7BYt5cTjLvG772ejjN/oxmnUxzBRIe5MJuwJwj7GkOX1jMZ1g48C0A6CWQfPeUbHgIxgKZ0+FCgwf+2TC70Au9OfYx35oHFglQYOGVXvyTbTyw4wVHQeGbjdBnswpHtrEHD7xHf7FZPoavpE5Xe9DSkb2zmYGffb8DeX/l9PT0z8XCBqaIExYogspsDO1h6KqIiJVJsppT7DVPCNoMXQBlKE8ByiHRBJZijEwRI3nR5Ah7qxwMz9H7+/szRngODg7mvdbgsR+fAr1HBrees/GFu0qDhn4ZlQPNF5hjtts3Jh089sDJZvRzaiQjLLB5z2Z4lxDpXpCNVdB7DrdWkOPVnvjnpwoK+/KheTjZzxr5+WPk5beKDGdJkJxk/7bJ1crJyclfC+YbBUXOpjzAjM+YGFZGMxRGRkqOwcXZ9gGKXnllVMrIaoYAsBI7ZnBgyevoDHTZ8vnz51mWdfTJs8ZQ1qtElfDRKVVQuOw5PDx8ry7pw3hhqxWApcAYAzZc3jmpLPfA5jglqyMpbO0hu6PSfDZjL7SwwGt/J0B0Y/CFrUrYHGz4oGcfGOAqeJJV++E3nT/aDDaBxGZ8WPuSDqPNFrielgGxwEEGwWVNEQsQwnoqwKxj0vnPqGjHiiSAAPAOUH1JTiHX3rKh4wSfAt5QJQu6eBeUMGeoKkAGsUZG/SVeno4vvwxv1C/hy8jW4ldCdBRUWfyyjfWyOf3Jzsm1D/VU9Vz0rIrn0Ppd/PVT1uAfEw+PgjN+9MSjhBLoVfD0qlJLwGwLW7rZr7DgyR4FjpHNCiIFo5OjdqX9eOTDufoxUmDqyQgtEOpzCj7AapSBLUs6Gu2TKVWe5gseowCu9wu8tXonPLtwJLuAMqLBi6PaC68j0p76yrDYh67eoiDqktHR2LFY058BBXsOTp96uS448aoPgpEMsmGArSpW4JHbcVpLUK9orUAZk5Nsv2EuocZkMLIZfu2vFyu5BbEmvQsEHBWSEqGkj1c9YD6o182fYZj1WByXf1fm6iNq9ppPEaB8jze1Mhdtzga43qbyn1E66ztCPBkHbdUqJ9QPJq8eL4XG3m/M2o7W8eIAV5eCDFZydbzI4Hq0+lLzZIyXoSreeFu1j93GCu67ZpseVa2O5G6Fgi/cHTfxKUm8F8zo2aG+Kt9VEbuEVMGrcAVfwfLRZuOxC5tC0u3xY3HIbyWiJKzo1H8v9m2sLgT9u2C8xwEiulKr5+q20tHj3EZYzyH7OsrqVyrhKWQNoIzjyYhVtRxXDzbeUDnbXnjwMC4uLt6Droa1KzNa72TDVgB1vEdX3+HdvjKY0xg6h5bFdCg4uzFyQNWTbHthq6WAXdUviMx3CtSAh6ubNDmtxWM8ymrGw9RfSh64CqZk4wXb+fn5/y4ixnhp41tD4ndcF1D1fGxS5Q1X9qiCd1mrMCx+r/8Dffqqu4hnJNMAAAAASUVORK5CYII=); }
          .sc-shutter-top { text-align: center; margin-bottom: 1rem; }
          .sc-shutter-bottom { text-align: center; margin-top: 1rem; }
            .sc-shutter-label { display: inline-block; font-size: 20px; vertical-align: middle; }
            .sc-shutter-position { display: inline-block; vertical-align: middle; padding: 0 6px; margin-left: 1rem; border-radius: 2px; background-color: var(--secondary-background-color); }
      `;
    
      this.card.appendChild(allShutters);
      this.appendChild(style);
    }
    
    //Update the shutters UI
    entities.forEach(function(entity) {
      let entityId = entity;
      if (entity && entity.entity) {
        entityId = entity.entity;
      }

      let invertPercentage = false;
      if (entity && entity.invert_percentage) {
        invertPercentage = entity.invert_percentage;
      }
        
      const shutter = _this.card.querySelector('div[data-shutter="' + entityId +'"]');
      const slide = shutter.querySelector('.sc-shutter-selector-slide');
      const picker = shutter.querySelector('.sc-shutter-selector-picker');
        
      const state = hass.states[entityId];
      const friendlyName = (entity && entity.name) ? entity.name : state ? state.attributes.friendly_name : 'unknown';
      const currentPosition = state ? state.attributes.current_position : 'unknown';
      
      shutter.querySelectorAll('.sc-shutter-label').forEach(function(shutterLabel) {
          shutterLabel.innerHTML = friendlyName;
      })
      
      if (!_this.isUpdating) {
        shutter.querySelectorAll('.sc-shutter-position').forEach(function (shutterPosition) {
          shutterPosition.innerHTML = currentPosition + '%';
        })

        if (invertPercentage) {
          _this.setPickerPositionPercentage(currentPosition, picker, slide);
        } else {
          _this.setPickerPositionPercentage(100 - currentPosition, picker, slide);
        }
      }
    });
  }
  
  getPictureTop(picture) {
      let pictureBox = picture.getBoundingClientRect();
      let body = document.body;
      let docEl = document.documentElement;

      let scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;

      let clientTop = docEl.clientTop || body.clientTop || 0;

      let pictureTop  = pictureBox.top + scrollTop - clientTop;
      
      return pictureTop;
  }
  
  setPickerPositionPercentage(position, picker, slide) {
    let realPosition = (this.maxPosition - this.minPosition) * position / 100 + this.minPosition;
  
    this.setPickerPosition(realPosition, picker, slide);
  }
  
  setPickerPosition(position, picker, slide) {
    if (position < this.minPosition)
      position = this.minPosition;
  
    if (position > this.maxPosition)
      position = this.maxPosition;
  
    picker.style.top = position + 'px';
    slide.style.height = position - this.minPosition + 'px';
  }
  
  updateShutterPosition(hass, entityId, position) {
    let shutterPosition = Math.round(position);
  
    hass.callService('cover', 'set_cover_position', {
      entity_id: entityId,
      position: shutterPosition
    });
  }

  setConfig(config) {
    if (!config.entities) {
      throw new Error('You need to define entities');
    }
    
    this.config = config;
    this.maxPosition = 137;
    this.minPosition = 19;
    this.isUpdating = false;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return this.config.entities.length + 1;
  }
}

customElements.define("shutter-card", ShutterCard);
