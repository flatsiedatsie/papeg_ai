/* Author: @UnrealSec */
class ContextMenu {
    constructor(container, items) {
        this.container = container;
		//console.log("contextMenu: this.container: ", this.container);
        this.dom = null;
        this.shown = false;
        this.root = true;
        this.parent = null;
        this.submenus = [];
        this.items = items;
		//this.last_mouse_down_time = 0;

		//window.context_menus.push(this);

        this._onclick = e => {
			
			//console.log("contextMenu: _onclick");
			
			if (this.dom && e.target != this.dom && 
				e.target.parentElement != this.dom && 
				!e.target.classList.contains('item') && 
				!e.target.parentElement.classList.contains('item')
			){
				//console.log("contextMenu: _onclick: hiding all (blocked)");
				//this.hideAll();
			
			}
			
			e.preventDefault();
			e.stopPropagation();
			//e.handled = true;
			//this.last_mouse_down_time = 0;
			
        };

        this._oncontextmenu = e => {
			//console.log("contextMenu: _oncontextmenu");
            e.preventDefault();
			e.stopPropagation();
			if (e.target != this.dom && 
                e.target.parentElement != this.dom && 
                !e.target.classList.contains('item') && 
                !e.target.parentElement.classList.contains('item')
			) {
				//console.log("_oncontextmenu is activating, calling show()");
				this.hideAll();
				this.show(e.clientX, e.clientY, e);
            }
        };

        this._oncontextmenu_keydown = e => {
            if (e.keyCode != 93) return;
            e.preventDefault();

            this.hideAll();
            this.show(e.clientX, e.clientY);
        };
		
        this._oncontextmenu_mousedown = e => {
			//console.log("contextmenu: mousedown detected");
            //this.last_mouse_down_time = Date.now();
			
			var isRightMB;
		    e = e || window.event;

			e.stopPropagation();
			
		    if ("which" in e){  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
		        isRightMB = e.which == 3; 
		    }else if ("button" in e){  // IE, Opera 
		        isRightMB = e.button == 2; 
			}
			
			if(isRightMB){
				//console.log("contextmenu: mousedown was rightmouse button");
				hide_all_context_menus();
				e.preventDefault();
			}
        };
		
        this._oncontextmenu_mouseup = e => {
			//console.log("contextmenu: mouseup detected");
			e.preventDefault();
			e.stopPropagation();
			e.handled = true;
			//window.last_time_context_menu_clicked = Date.now();
			if(Date.now() - this.last_mouse_down_time > 500 && Date.now() - this.last_mouse_down_time < 5000){
				//console.warn(" mouseup: Detected long mouse press on context menu");
				e.preventDefault();
				e.stopPropagation();
				e.handled = true;
				//hide_all_context_menus();
				//e.preventDefault();
				this._oncontextmenu(e);
				setTimeout(() => {
					//console.log("delayed right mouse click. e: ", e);
					
					//this.hideAll();
					
					this.show(e.clientX, e.clientY, e);
				},300);
			
			
				// simulate right mouse button click
				//var e = element.ownerDocument.createEvent('MouseEvents');

				//e.initMouseEvent('contextmenu', true, true,
				//     element.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,
				//     false, false, false,2, null);
				//return !element.dispatchEvent(e);
				
			}
			
			
            //this.last_mouse_down_time = Date.now();
			/*
			var isRightMB;
		    e = e || window.event;

			e.stopPropagation();
			
		    if ("which" in e){  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
		        isRightMB = e.which == 3; 
		    }else if ("button" in e){  // IE, Opera 
		        isRightMB = e.button == 2; 
			}
			
			if(isRightMB){
				//console.log("contextmenu: mousedown was rightmouse button");
				hide_all_context_menus();
				e.preventDefault();
			}
			*/
        }
		
        this._onblur = e => {
			//console.log("context menu: detected blur");
            this.hideAll();
        };
    }

    getMenuDom() {
        const menu = document.createElement('div');
        menu.classList.add('context');

        for (const item of this.items) {
            menu.appendChild(this.itemToDomEl(item));
        }

        return menu;
    }

    itemToDomEl(data) {
        const item = document.createElement('div');

        if (data === null) {
            item.classList = 'separator';
            return item;
        }

        if (data.hasOwnProperty('color') && /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(data.color.toString())) {
            item.style.cssText = `color: ${data.color}`;
        }

        item.classList.add('item');
		item.setAttribute('data-text',data.hasOwnProperty('text') ? data['text'].toString() : '');
        const label = document.createElement('span');
        label.classList = 'label';
		
        label.innerHTML = data.hasOwnProperty('text') ? data['text'].toString() : '';
        item.appendChild(label);

        if (data.hasOwnProperty('disabled') && data['disabled']) {
            item.classList.add('disabled');
        } else {
            item.classList.add('enabled');
        }

        const hotkey = document.createElement('span');
        hotkey.classList = 'hotkey';
        hotkey.innerText = data.hasOwnProperty('hotkey') ? data['hotkey'].toString() : '';
        item.appendChild(hotkey);

        if (data.hasOwnProperty('subitems') && Array.isArray(data['subitems']) && data['subitems'].length > 0) {
            const menu = new ContextMenu(this.container, data['subitems']);
            menu.root = false;
            menu.parent = this;

            const openSubItems = e => {
                if (data.hasOwnProperty('disabled') && data['disabled'] == true)
                    return;

                this.hideSubMenus();

                const x = this.dom.offsetLeft + this.dom.clientWidth + item.offsetLeft;
                const y = this.dom.offsetTop + item.offsetTop;

                if (!menu.shown) {
                    menu.show(x, y);
                } else {
                    menu.hide();
                }
            };

            this.submenus.push(menu);

            item.classList.add('has-subitems');
            item.addEventListener('click', openSubItems);
            item.addEventListener('mousemove', openSubItems);
        } 
		else if (data.hasOwnProperty('submenu') && data['submenu'] instanceof ContextMenu) {
            const menu = data['submenu'];
            menu.root = false;
            menu.parent = this;

            const openSubItems = e => {
                if (data.hasOwnProperty('disabled') && data['disabled'] == true)
                    return;

                this.hideSubMenus();

                const x = this.dom.offsetLeft + this.dom.clientWidth + item.offsetLeft;
                const y = this.dom.offsetTop + item.offsetTop;

                if (!menu.shown) {
                    menu.show(x, y);
                } else {
                    menu.hide();
                }
            };

            this.submenus.push(menu);

            item.classList.add('has-subitems');
            item.addEventListener('click', openSubItems);
            item.addEventListener('mousemove', openSubItems);
        } 
		else {
            item.addEventListener('click', e => { 
				//console.log("clicked on context menu item");
				e.preventDefault();
				e.stopPropagation();
				
                this.hideSubMenus();

                if (item.classList.contains('disabled'))
                    return;

                if (data.hasOwnProperty('onclick') && typeof data['onclick'] === 'function') {
                    const event = {
                        handled: false,
                        item: item,
                        label: label,
                        hotkey: hotkey,
                        items: this.items,
                        data: data,
						event:e,
						context:this
                    };
        
                    data['onclick'](event);
        			
                    if (!event.handled) {
                        this.hide();
                    }
                } else {
                    this.hide();
                }
				
            });

            item.addEventListener('mousemove', e => {
                this.hideSubMenus();
            });
			
			item.addEventListener('mousedown', e => { 
				e.stopPropagation();
			});
			item.addEventListener('mouseup', e => { 
				e.stopPropagation();
			});
        }

        return item;
    }

    hideAll() {
        if (this.root && !this.parent) {
            if (this.shown) {
                this.hideSubMenus();

                this.shown = false;
                this.container.removeChild(this.dom);

                if (this.parent && this.parent.shown) {
                    this.parent.hide();
                }
            }

            return;
        }

        this.parent.hide();
    }

    hide() {
        if (this.dom && this.shown) {
            this.shown = false;
            this.hideSubMenus();
            this.container.removeChild(this.dom);

            if (this.parent && this.parent.shown) {
                this.parent.hide();
            }
        }
    }

    hideSubMenus() {
        for (const menu of this.submenus) {
            if (menu.shown) {
                menu.shown = false;
                menu.container.removeChild(menu.dom);
            }
            menu.hideSubMenus();
        }
    }

    show(x, y,e=null) {
        this.dom = this.getMenuDom();
		//console.log("context menu: show: this.dom: ", this.dom);
		
		let final_y = y;
		
		this.dom.style.left = `${x}px`;
		
		if(e.clientY > (window.innerHeight * 0.7)){
			final_y = window.innerHeight - y;
			this.dom.style.top = `auto`;
			this.dom.style.bottom= `${final_y}px`;
		}
		else{
			this.dom.style.top = `${y}px`;
			this.dom.style.bottom = `auto`;
		}
		
		/*
		let final_y = e.clientY;
		//console.log("e.clientY: ", e.clientY);
		//console.log("window.innerHeight: ", window.innerHeight);
		//console.log("this.dom.clientHeight: ", this.dom.clientHeight);
		if(final_y > + 100 > window.innerHeight){
			//console.log("context menu: TOO DAMN HIGH");
			final_y = final_y - this.dom.clientHeight;
		}
		*/
		
        
        
        

        this.shown = true;
        this.container.appendChild(this.dom);
    }

    install() {
        this.container.addEventListener('contextmenu', this._oncontextmenu);
        this.container.addEventListener('keydown', this._oncontextmenu_keydown);
		this.container.addEventListener('mousedown', this._oncontextmenu_mousedown);
		this.container.addEventListener('mouseup', this._oncontextmenu_mouseup);
        this.container.addEventListener('click', this._onclick);
        window.addEventListener('blur', this._onblur);
		//window.addEventListener('click', this._onclick);
    }

    uninstall() {
		//console.log("uninstalling context menu");
        this.dom = null;
        this.container.removeEventListener('contextmenu', this._oncontextmenu);
        this.container.removeEventListener('keydown', this._oncontextmenu_keydown);
		this.container.removeEventListener('mousedown', this._oncontextmenu_mousedown);
		//this.container.removeEventListener('mouseup', this._oncontextmenu_mouseup);
        this.container.removeEventListener('click', this._onclick);
        window.removeEventListener('blur', this._onblur);
		//window.removeEventListener('click', this._onclick);
    }
}