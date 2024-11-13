
const folder_select_container_el = document.getElementById('folder-select-container');
let context_menu_mouse_down_timer = 0;



//
// CONTEXT MENU SCRIPT, placed here to avoid a separate server request
//

/* Author: @UnrealSec */
class ContextMenu {
    constructor(container, items) {
        this.container = container;
        this.dom = null;
        this.shown = false;
        this.root = true;
        this.parent = null;
        this.submenus = [];
        this.items = items;

        this._onclick = e => {
			e.preventDefault();
			e.stopPropagation();
        };

        this._oncontextmenu = e => {
            e.preventDefault();
			e.stopPropagation();
			if (e.target != this.dom && 
                e.target.parentElement != this.dom && 
                !e.target.classList.contains('item') && 
                !e.target.parentElement.classList.contains('item')
			) {
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
			
			var isRightMB;
		    e = e || window.event;

			e.stopPropagation();
			
		    if ("which" in e){  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
		        isRightMB = e.which == 3; 
		    }else if ("button" in e){  // IE, Opera 
		        isRightMB = e.button == 2; 
			}
			
			if(isRightMB){
				hide_all_context_menus();
				e.preventDefault();
			}
        };
		
        this._oncontextmenu_mouseup = e => {
			e.preventDefault();
			e.stopPropagation();
			e.handled = true;
			if(Date.now() - this.last_mouse_down_time > 500 && Date.now() - this.last_mouse_down_time < 5000){
				//console.warn(" mouseup: Detected long mouse press on context menu");
				e.preventDefault();
				e.stopPropagation();
				e.handled = true;
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


if(flash_message_el){
	flash_message_el.onclick = () => {flash_message_el.textContent = ''}
}


function close_sidebar(){
	document.body.classList.remove('sidebar');
	document.body.classList.remove('busy-selecting-assistants');
	window.settings.left_sidebar_open = false;
	save_settings();
}
function open_sidebar(){
	document.body.classList.add('sidebar');
	document.body.classList.remove('sidebar-shrink');
	window.settings.left_sidebar_open = true;
	save_settings();
	if(typeof generate_task_overview == 'function'){
		generate_task_overview();
	}
	
}

document.getElementById('open-sidebar-button').addEventListener('click',open_sidebar);
document.getElementById('close-sidebar-button').addEventListener('click',close_sidebar);


load_all_files_button_el.onclick = () => {
	loadAll();
}


function toggle_execute(){
	//console.log("in toggle_execute. allow_execute: ", allow_execute);
	autoparse = true;
	allow_execute = !allow_execute;
	if(allow_execute){
		document.body.classList.add('executing');
		executeCode();
	}
	else{
		document.body.classList.remove('executing');
	}
}




//
//  FILE TABS
//


// Context menu clicks
const tabsClickHandler = e => {
	//console.log("\n\nin tabsClickHandler.  e:", e, e.event, e.label.textContent);    
    e.event.stopPropagation();
    e.event.preventDefault();
	
	if(e.label.textContent == 'Cancel'){
		//document.querySelector('.context').style.display = 'none';
	}
	
	else if(e.label.textContent == 'Save all'){
		//console.log("clicked Save all");
		/*
		let filename = filename;
		//console.log("file context menu: chose save.  filename: ", filename);
		if(typeof filename == 'string' && typeof playground_live_backups[ folder + '/' + filename ] != 'undefined'){
			save_file(filename, playground_live_backups[ folder + '/' + filename ]);
		}
		else{
			flash_message("could not save file, missing data.",2000,'fail');
		}
		*/
	}
	
	else if(e.label.textContent == 'Save all to production'){
		//console.log("clicked Save all to production");
		/*
		let filename = filename;
		//console.log("file context menu: chose save to production.  filename: ", filename);
		if(typeof filename == 'string' && typeof playground_live_backups[ folder + '/' + filename ] != 'undefined'){
			save_file(filename, playground_live_backups[ folder + '/' + filename ],'production');
		}
		else{
			flash_message("could not save file to production, missing data.",2000,'fail');
		}
		*/
	}
	
	
	else if(e.label.textContent == 'Delete'){
		console.error("UNHANDLED DELETE REQUEST");
		/*
		let filename_to_delete = filename;
		//console.log("Delete chosen. filename_to_delete: ", filename_to_delete);
		
        vex.dialog.confirm({
            message: 'Are you sure you want to delete ' + filename_to_delete + '?',
            callback: function (value) {
                if (value) {
					//let file_name = fileItem.getAttribute('data-file');
					//console.log("delete value: ", value)
					//console.log("delete data-file: ", filename_to_delete);
                    //const index = keyz(files).indexOf(fileItem.getAttribute('data-file'));
                    //if (index > -1) {
					if(typeof files[filename_to_delete] != 'undefined'){
                        //editor_set_value('');
                        //files.splice(index, 1);
						delete_file( filename_to_delete );
						
						open_file(unsaved_file_name);
                        current_file_name = unsaved_file_name;
                        update_ui();
                    }
					else{
						console.error("deleteBtn: value was not in files: ", value );
					}
                }
            }
        });
		*/
	}
	
	e.handled = true;
	e.context.hide();
	return false;
}

/*
// TODO disabled for AI Chat project
const file_tabs_context_menu = new ContextMenu(file_tabs_container_el, [
    {text: 'Back', hotkey: 'Alt+Left arrow', disabled: true, onclick: clickHandler},
    {text: 'Forward', hotkey: 'Alt+Right arrow', disabled: true, onclick: clickHandler},
    {text: 'Translate to English', onclick: clickHandler},
    null,
    {text: 'Save all', onclick: tabsClickHandler},
	
	//{text: 'Save all to production', onclick: tabsClickHandler}, 
	{text: 'Cancel', onclick: tabsClickHandler},
]);

file_tabs_context_menu.install();

file_tabs_container_el.addEventListener('contextmenu', (e) => {
	//console.log("detected context menu (and prevented default)");
	e.preventDefault();
});
*/






async function update_ui_file_tabs(action='refresh'){
	//console.log("\n\n\nin update_ui_file_tabs\n\n\n");
	file_tabs_container_el.innerHTML = '';
	
	let spotted_folders = [];
	if(current_project != null){
		if(typeof projects[current_project] != 'undefined'){
			if(typeof projects[current_project].file_tabs != 'undefined'){

				let added_filenames = [];
				let double_filenames = [];
				let file_tab_counter = 0;
				
				function add_between(details=null){
					//console.log("add_between:  details: ", details)
					let draggable_el = document.createElement('div');
					draggable_el.classList.add('in-between-draggable');
					draggable_el.setAttribute('data-index',file_tab_counter);
					if(details != null){
						draggable_el.setAttribute('data-uuid',details.folder + '/' + details.filename);
						//draggable_el.setAttribute('title',details.folder + '/' + details.filename);
						draggable_el.setAttribute('data-folder',details.folder);
						draggable_el.setAttribute('data-filename',details.filename);
					}
					//file_tab_counter++;
					file_tabs_container_el.appendChild(draggable_el);
				}
				
				if(projects[current_project].file_tabs.length == 0){
					//console.log("Not generating tabs, as there are too few");
					document.body.classList.remove('has-tabs');
					return;
				}
				document.body.classList.add('has-tabs');
				
				if(projects[current_project].file_tabs.length > 1){
					//add_between();
					document.body.classList.add('multiple-tabs');
				}
				else{
					document.body.classList.remove('multiple-tabs');
					
				}
				
				
				for (const[index, details] of Object.entries(projects[current_project].file_tabs)) {
					
					if(added_filenames.indexOf(details.filename) != -1){
						double_filenames.push(details.filename);
					}
					added_filenames.push(details.filename);
					
					let draggable_el = document.createElement('div');
					draggable_el.classList.add('draggable');
					
					if(spotted_folders.indexOf(details.folder) == -1){
						spotted_folders.push(details.folder);
					}
					
					if(details.folder == folder && details.filename == current_file_name){
						draggable_el.classList.add('selected');
					}
					
					let folder_name = details.folder;
					if(folder_name == ''){
						folder_name='<span class="file-tabs-folder-last-part">/</span>';
					}
					else{
						folder_name = '<span class="file-tabs-folder-last-part">/' + details.folder.split('/')[details.folder.split('/').length-1] + '</span>';
						if( uninformative_folder_names.includes(folder_name.toLowerCase()) ){
							folder_name = '<span class="file-tabs-folder-second-to-last-part">/' + details.folder.split('/')[details.folder.split('/').length-2] + '</span>' + folder_name;
						}
					}
					folder_name = '<span class="file-tabs-folder-inner-wrapper">' + folder_name + '</span>';
					
					draggable_el.setAttribute('data-index',file_tab_counter);
					draggable_el.setAttribute('data-uuid',details.folder + '/' + details.filename);
					draggable_el.setAttribute('title',details.folder + '/' + details.filename);
					draggable_el.setAttribute('data-folder',details.folder);
					draggable_el.setAttribute('data-filename',details.filename);
					draggable_el.setAttribute('draggable','true');
					let tab_close_button_el = document.createElement('div');
					tab_close_button_el.textContent = '✕';
					tab_close_button_el.classList.add('draggable-tab-close-button');
					tab_close_button_el.onclick = (event) => {
						//console.log("clicked on file tab close button."); 
					    event.stopPropagation();
					    event.preventDefault();
						//console.log("clicked on file tab close button. ", event.target.parentNode.getAttribute('data-uuid'), event.target.parentNode.getAttribute('data-folder'), event.target.parentNode.getAttribute('data-filename'),event.target.parentNode.getAttribute('data-index'));
						//current_file_name = event.target.parent.getAttribute('data-filename');
						//folder = event.target.parent.getAttribute('data-folder');
						remove_file_tab(event.target.parentNode.getAttribute('data-filename'),event.target.parentNode.getAttribute('data-folder'));
					}
					draggable_el.appendChild(tab_close_button_el);
					
					let path_span_el = document.createElement('span');
					path_span_el.classList.add("draggable-tab-path-wrapper");
					
					let folder_span_el = document.createElement('span');
					folder_span_el.classList.add('draggable-tab-folder-wrapper');
					folder_span_el.innerHTML = folder_name;
					path_span_el.appendChild(folder_span_el);
					
					
					let file_span_wrapper_el = document.createElement('span');
					file_span_wrapper_el.classList.add('draggable-tab-filename-wrapper');
					
					let file_span_el = document.createElement('span');
					file_span_el.classList.add('draggable-tab-filename');
					file_span_el.textContent = details.filename;
					file_span_wrapper_el.appendChild(file_span_el);
					path_span_el.appendChild(file_span_wrapper_el);
					draggable_el.appendChild(path_span_el);
					
					let status_span_el = document.createElement('span');
					status_span_el.classList.add('draggable-tab-status');
					draggable_el.appendChild(status_span_el);
					
					draggable_el.onclick = (event) => {
						open_both(details.folder,details.filename);
					}
					file_tabs_container_el.appendChild(draggable_el);
					file_tab_counter++;
					
					if(projects[current_project].file_tabs.length > 1){
						add_between(details);
					}
					
				}
				
				// add drag listeners
				draggableElements = document.querySelectorAll('[draggable="true"]');
				inBetweenElements = document.querySelectorAll('.in-between-draggable');
				
				//console.log("added_filenames: ", added_filenames);
				if(double_filenames.length){
					//console.log("spotted double filename in tabs: ", double_filenames);
					document.body.classList.add("show-tab-folders");
					//[].forEach.call(draggableElements, function(element) {
					for(let o = 0; o < draggableElements.length; o++){
						let element = draggableElements[o];
						//console.log("checking draggableElements for doubles: ", element.getAttribute('data-filename'));
						if(double_filenames.includes(element.getAttribute('data-filename'))){
							console.error("BINGO double filename tab: ", draggableElements[o], element.getAttribute('data-filename'));
							draggableElements[o].classList.add("double-tab-name");
						}
					};
				}
				else{
					document.body.classList.remove("show-tab-folders");
				}
				
				[].forEach.call(draggableElements, function(element) {
					//console.log("adding listener to draggableElement: ", element);
				    element.addEventListener('dragstart', handleDragStart, false);
				    element.addEventListener('dragenter', handleDragEnter, false);
				    element.addEventListener('dragover', handleDragOver, false);
				    element.addEventListener('dragleave', handleDragLeave, false);
				    element.addEventListener('drop', handleDrop, false);
				    element.addEventListener('dragend', handleDragEnd, false);
				});

				[].forEach.call(inBetweenElements, function(element) {
					//console.log("adding listener to inBetweenElement: ", element);
				    element.addEventListener('dragenter', handleDragEnter, false);
				    element.addEventListener('dragover', handleDragOver, false);
				    element.addEventListener('dragleave', handleDragLeave, false);
				    element.addEventListener('drop', handleDrop, false);
				});
				
			}
			
		}
		
	}
	if(spotted_folders.length < 2 && spotted_folders[0] == folder){
		document.body.classList.remove('tabs-for-multiple-folders');
	}
	else{
		document.body.classList.add('tabs-for-multiple-folders');
	}
}

// helper function for file tabs functinonality
async function open_both(target_folder, target_filename){
	console.log("in open_both.  target_folder, target_filename: ", target_folder, target_filename);
	if(typeof target_folder == 'string'){
		await open_folder(target_folder);
		
		if(typeof target_filename == 'string'){
			await open_file(target_filename,null,target_folder);
		}
		else{
			console.error("open_both: target_folder was a string, but target_filename was not?: ", target_folder, target_filename);
		}
		
		setTimeout(() => {
			update_ui();
		},10);
	}
	else{
		console.error("open_both: target_folder was not a string: ", target_folder);
	}
	
}


function handleDragStart(event) {
    localStorage.setItem('playground_current_drag_element', event.target.dataset.uuid);
    event.dataTransfer.setData("text/plain", event.target.dataset.uuid);
}


function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(event) {
    this.classList.add('over');
}

function handleDragLeave(event) {
    this.classList.remove('over');
}

function handleDrop(event) {
    event.stopPropagation();
    event.preventDefault();

	file_tabs_container_el.classList.remove("dragging-over");

    if(localStorage.getItem('playground_current_drag_element') == event.target.dataset.uuid) {
		//console.log("dropped on itself");
		localStorage.setItem('playground_current_drag_element', null);
        return;
    }

	//let current_drag_el_uuid = current_project + '__' +

    playground_current_drag_element = document.querySelector('[data-uuid="'+localStorage.getItem('playground_current_drag_element')+'"]');

    console.log('dragged element: >>>\n', playground_current_drag_element.getAttribute('data-uuid'), playground_current_drag_element.getAttribute('data-index') , ' on element ', event.target.getAttribute('data-uuid'), event.target.getAttribute('data-index'));

	let old_index = playground_current_drag_element.getAttribute('data-index');
	//console.log("dragged element: old_index: ", old_index);
	let old_folder = playground_current_drag_element.getAttribute('data-folder'); //playground_current_drag_element.getAttribute('data-uuid').split( '/' ).slice( 0, -1 ).join( '/' );
	//console.log("dragged element: old_folder: ", old_folder);
	let old_filename = playground_current_drag_element.getAttribute('data-filename'); //playground_current_drag_element.getAttribute('data-uuid').split( '/' ).pop();
	//console.log("dragged element: old_filename: ", old_filename);
	let drag_index = event.target.getAttribute('data-index');
	//console.log("dragged element: drag_index: ", old_index,' -> ',drag_index);
	if(drag_index > old_index){drag_index--;}
	
	if(drag_index != null){
		//console.log("dragged element: original tabs:",JSON.stringify(projects[current_project].file_tabs,null,2));
		remove_file_tab(old_filename,old_folder,false);
		//console.log("dragged element: reshuffled tabs halfway:",JSON.stringify(projects[current_project].file_tabs,null,2));
		//console.log("dragged element: drag_index adjusted: ", old_index,' -> ',drag_index);
		add_file_tab(old_filename,old_folder,drag_index);
		//console.log("dragged element: reshuffled tabs:",JSON.stringify(projects[current_project].file_tabs,null,2));
	}
	
	
    localStorage.setItem('playground_current_drag_element', null);
	
    return false;
}

function handleDragEnd(event) {
    [].forEach.call(draggableElements, function (element) {
		element.classList.remove('over');
    });
	[].forEach.call(inBetweenElements, function(element) {
		element.classList.remove('over');
	});
}




function remove_file_tab(filename=null,target_folder=null,done=true){
	//console.log("in remove_file_tab.  target_folder,filename,done", target_folder,filename,done);
	if(target_folder==null){target_folder=folder}
	if(filename == null){
		console.error("remove_file_tab: no filename provided");
		return
	}
	//console.log("in remove_file_tab.  current_project,target_folder,filename: ",current_project,target_folder,filename);
	
	let switch_tabs = false;
	let found_it = false;
	if(filename == current_file_name){
		switch_tabs = true;
		console.warn("file tab being removed is the currently active one");
	}
	let file_to_switch_to = null;
	let folder_to_switch_to = null;
	
	if(current_project != null){
		if(typeof projects[current_project] != 'undefined'){
			if(typeof projects[current_project].file_tabs != 'undefined'){
				//console.log("remove_file_tabs: tab length before: " + projects[current_project].file_tabs.length);
				for(let f = projects[current_project].file_tabs.length - 1; f >= 0 ; f--){
					//console.log(projects[current_project].file_tabs[f].filename, " =?= ", filename);
					if(projects[current_project].file_tabs[f].folder == target_folder && projects[current_project].file_tabs[f].filename == filename ){
						//console.log("remove_file_tab: removing item from file-tabs array: ", projects[current_project].file_tabs[f].filename);
						projects[current_project].file_tabs.splice(f,1);
						found_it = true;
						if(file_to_switch_to != null){
							break;
						}
					}
					else{
						file_to_switch_to = projects[current_project].file_tabs[f].filename;
						folder_to_switch_to = projects[current_project].file_tabs[f].folder;
						if(found_it == true){break}
					}
				}
			}
		}
		else{
			console.error("remove_file_tab: current_project is set, but does not exist in projects dict: ", current_project, projects);
		}
	}
	else{
		console.error("remove_file_tab: current_project is null");
	}
	localStorage.setItem('_playground_projects', JSON.stringify(projects));
	
	//console.log("remove_file_tabs: tab length after: " + projects[current_project].file_tabs.length);
	
	if(done){
		if(switch_tabs && file_to_switch_to != null){
			//console.log("switching to adjacent file tab: ", folder_to_switch_to, file_to_switch_to);
			setTimeout(() => {
				open_file(file_to_switch_to,null,folder_to_switch_to);
			},1);
		}
		update_ui_file_tabs();
	}
	
}


function add_file_tab(filename=null,target_folder=null,index=null){
	if(target_folder==null){target_folder=folder}
	//console.log("in add_file_tab. target_folder,filename: ", target_folder, filename);
	
	if(filename == null){
		console.error("add_file_tab: provided filename was null");
		return;
	}
	
	//console.log("add_file_tab: current_project: ", typeof current_project, current_project);
	//console.log("add_file_tab: projects: ", typeof projects, projects);
	
	if(typeof current_project != 'string' || typeof projects != 'object' || typeof projects[current_project] == 'undefined'){
		console.warn("add_file_tab: no current project yet");
		console.warn("- current_project: ", typeof current_project, current_project);
		console.warn("- projects: ", typeof projects, projects);
		
		//update_projects('add',filename);
		//return;
	}
	
	if(current_project == null){
		
		update_projects('add','default_project'); // disabled more complext project management for AI chat project
		_really_add_file_tab(target_folder,filename,index);
		/*
		let suggested_project_name = target_folder;
		suggested_project_name = suggested_project_name.replaceAll('/','');
		//if(suggested_project_name.startsWith('/')){suggested_project_name = target_folder.substr(1)}
		if(suggested_project_name==''){suggested_project_name=makeid(6)}
	    vex.dialog.prompt({
	        message: 'Provide new project name',
			//value: '',
	        placeholder: 'Project name',
	        callback: function (value) {
				if(value != ''){
					//console.log("user provided a new project name: ", value);
					update_projects('add',value);
					_really_add_file_tab(target_folder,filename,index);
					//display_projects();
				}
				else{
					flash_message('Invalid project name', 2000,'fail');
				}
	        }
	    });
		*/
	}
	
	else{
		_really_add_file_tab(target_folder,filename,index);
	}
	
	
	function _really_add_file_tab(target_folder,filename,index){
		//console.log("really_add_file_tab:  target_folder,filename,index: ", target_folder,filename,index);
		
		if(target_folder != '' && ! target_folder.startsWith('/')){
			target_folder = '/' + target_folder;
		}
		
		// check if this tab hasn't already been added
		for(var n = 0; n < projects[current_project].file_tabs.length; n++) {
			if(projects[current_project].file_tabs[n].folder == target_folder && projects[current_project].file_tabs[n].filename == filename){
				console.warn("that file already has a file tab: ", target_folder, filename);
				return
			}
		}
		
		if(index == null){
			//console.log("dragged element: add_file_tab: index: ", index);
			projects[current_project].file_tabs.push({
				'folder':target_folder, // currently open folder
				'filename':filename,
			});
		}
		else{
			//console.log("dragged element: add_file_tab: index: ", index);
			projects[current_project].file_tabs.splice(index, 0, {
				'folder':target_folder, // currently open folder
				'filename':filename,
			});
		}
		
		
		localStorage.setItem('_playground_projects', JSON.stringify(projects));
		//localStorage.setItem(folder + 'playground_modified_files', JSON.stringify(playground_modified_files));
	
		current_file_name = filename;
	
		update_ui_file_tabs();
		//console.log("add_file_tab: going to call open_file with target_folder, filename: ", target_folder, filename);
		open_file(filename,null,target_folder);
	}
}




function update_projects(action='add',value=null){
	//console.log("in update_projects. action,value: ", action,value);
	if(value == null){
		console.error("update_projects: provided value was null.  action: ", action);
		return
	}
	if(action == 'add'){
		value = value.replaceAll('/','');
		current_project = value;
		//console.log("current_project is now: ", value);
		localStorage.setItem('_playground_current_project', value);
		if(typeof projects[current_project] == 'undefined'){
			projects[current_project] = {'file_tabs':[]};
		}
	}
	else if(action == 'remove'){
		if(typeof projects[value] != 'undefined'){
			delete projects[value];
		}
		if(value == current_project){
			current_project = null;
		}
	}
	
	localStorage.setItem('_playground_projects', JSON.stringify(projects));
}


















//
//  HAMBURGER MENU
//


document.body.onclick = (event) => {
	//console.log("body clicked. event.target.id: ", typeof event.target.id, event.target.id);
	if(typeof event.target.id == 'string'){
		
		if(document.body.classList.contains('hamburger') && event.target.id == 'hamburger-lines'){
			document.body.classList.remove('hamburger');
		}
		else if(event.target.id.startsWith('hamburger')){
			document.body.classList.add('hamburger');
		}
		else{
			document.body.classList.remove('hamburger');
		}
	}
	else{
		document.body.classList.remove('hamburger');
	}
}









//
//  UPDATE UI
//

// Dodgy, I know. This is to avoid rebuilding the UI too often in quick succession
//let update_ui_moment = 0;
let ui_update_timeout = null;
function update_ui(){
	//console.warn("in update_ui");

	if(ui_update_timeout != null){
		//console.log("update_ui: clearing old update_ui timeout");
		clearTimeout(ui_update_timeout);
		ui_update_timeout = null;
	}
	
	if(ui_update_timeout == null){
		ui_update_timeout = setTimeout(function(){
			update_ui_timeout = null;
			update_ui_file_menu();
		},101);
	}
	
}


function update_ui_file_menu(file_list=null) {
	//console.log("in update_ui_file_menu. provided file_list: ", file_list);
	//console.log("update_ui_file_menu: folder path parts: ", folder_parts);
	let modified_file_count = 0;
	let unloaded_file_count = 0;
	let beta_file_count = 0;
	
	let new_folder_view_els = [];
	let new_file_list_els = [];
	let new_folder_list_els = [];
	
	// remove old context menu listeners
	for(var c = 0; c < window.context_menus.length; c++) {
		window.context_menus[c].uninstall();
	}
	window.context_menus = [];
	
	file_menu_el.innerHTML = '';
	
	if(file_list == null){
		file_list = keyz(files);
	}
	
	//console.log("update_ui_file_menu: file_list.length: ", file_list.length, file_list);

	if(file_list.length == 0){
		document.body.classList.add('no-files-in-folder');
	}
	else{
		document.body.classList.remove('no-files-in-folder');
	}
	
	
	
	
	
	// Generate folder tree
	//folder_select_container_el.innerHTML = '';
	let folder_tree_el = document.createElement('div');
	folder_tree_el.classList.add('folder-tree');
	
	
	let indent = '';
	let partial_folder_path = '';
	if(folder_parts.length == 0){
		folder_parts = [''];
		folder_select_container_el.innerHTML = '';
		//document.body.classList.remove('has-folders');
	}
	
	else{
		let folder_path_so_far = '';
		for(let fp=0; fp<folder_parts.length; fp++){
			let folder_part_name = folder_parts[fp];
			
			let my_folder_path = '';
			
			// Create folder item
			new_folder_option_el = document.createElement('div');
			new_folder_option_el.classList.add('folder-tree-item');
			
			// Root item is special
			if(fp==0){
				folder_part_name = '🗄️';
				new_folder_option_el.classList.add('folder-tree-root');
				new_folder_option_el.classList.add('unicode-icon');
			}
			else{
				folder_path_so_far += '/' + folder_part_name;
				my_folder_path = '' + folder_path_so_far;
			}
			//console.log("adding part to folder tree: ", folder_part_name);
			
			// Create indentation
			for(let indent_count=0; indent_count<fp; indent_count++){
				new_indent_el = document.createElement('span');
				new_indent_el.classList.add('folder-tree-indent');
				new_indent_el.classList.add('folder-tree-indent' + (fp - indent_count));
				new_folder_option_el.appendChild(new_indent_el);
			}
		
			// Add folder name
			folder_tree_el.appendChild(new_folder_option_el);
			new_folder_name_el = document.createElement('div');
			new_folder_name_el.classList.add('folder-tree-name');
			
			new_folder_name_el.textContent = folder_part_name;
			new_folder_option_el.appendChild(new_folder_name_el);
			
			// Indicate the current one. Which should be the last one. 
			if(partial_folder_path == folder){
				//console.log("create folder tree: current folder path: ", partial_folder_path);
				new_folder_option_el.classList.add('folder-tree-current');
			}
			
			new_folder_option_el.addEventListener('click',() => {
				//console.log("my_folder_path: ", my_folder_path);
				if(my_folder_path != '/' + folder){
					open_folder(my_folder_path);
				}
				else{
					//console.log("already in this folder: ", my_folder_path);
				}
			});
			
			folder_tree_el.appendChild(new_folder_option_el);
			//folder_select_el.appendChild(new_folder_option_el);
		}
		
		folder_select_container_el.innerHTML = '';
		folder_select_container_el.appendChild(folder_tree_el);
	}
	
	
	
	
	
	
	// Create files list
	
	if(file_list.length > 3){
		document.body.classList.add('many-files');
	}
	else{
		document.body.classList.remove('many-files');
	}
	
	
	// No files and no folders: show a hint
	if(file_list.length < 1 && keyz(sub_folders).length == 0){
		if(file_manager_files_list_el){
			file_manager_files_list_el.innerHTML = '<div id="upload-a-file-hint" class="center"><div id="upload-a-file-hint-centered"><h3><span class="unicode-icon large-icon">📄</span><br><span data-i18n="Click_here_to_open_files">' + get_translation('Click_here_to_open_files') + '</span></h3><p class="drag-files-here-hint" data-i18n="or_drag_them_here">' + get_translation('or_drag_them_here') + '</p></div></div>';
			setTimeout(() => {
				document.getElementById('upload-a-file-hint-centered').addEventListener('click', () => {
					document.getElementById('upload-file-input').click();
				})
			},1);
		}
		if(folder == ''){
			document.body.classList.remove('has-folders');
		}
		else{
			document.body.classList.add('has-folders');
		}
	}
	else if(keyz(sub_folders).length > 0){
		document.body.classList.add('has-folders');
	}
	
	if(file_list.length < 1){
		document.body.classList.remove('has-file');
	}
	else{
		document.body.classList.add('has-file');
	}
	
	for(var f = file_list.length - 1; f >= 0; f--) {
	
		let file = file_list[f];
		
		if(file == unsaved_file_name){
			continue;
		}
		
		let fileContextMenu;
		
		let file_icon_html = '';
		
        const fileItem = document.createElement('li');
		fileItem.classList.add('file-item');
		
		fileItem.setAttribute('data-full-path', folder + '/' + file);
		
		// TODO: allow draging files into folders
		//fileItem.setAttribute('draggable','true'); // draggable="true"
		
		if(file == unsaved_file_name){
			continue;
			fileItem.classList.add('notepad');
			fileItem.classList.add('notepad-file-browser-item');
			fileItem.setAttribute('data-i18n','notepad');
			fileItem.innerHTML = '<span class="notepad-icon unicode-icon">🗒</span><span class="file-name">Notepad</span>'; // <span class="material-icons">article</span>
			
		}
		else{
			//let file_icon = '📄';
			let file_icon = '<div class="file-list-image svg-file-list-image"><img src="./images/document_icon.svg" alt="Image" width="16" height="16"></div>';
			const is_image = filename_is_image(file);
			
			if(is_image){
				//file_icon = '🖼️';
				file_icon = '<div class="file-list-image svg-file-list-image"><img src="./images/image_icon.svg" alt="Image" width="16" height="16"></div>';
				if(serverless){
					let img_el = generate_image_html(null,folder,file,null,true); // skip updating image_to_text preview image
					if(img_el){
						img_el.classList.add("file-list-image");
						file_icon_html = img_el.outerHTML;
						//console.log("file_icon_html: ", file_icon_html);
						if(file_icon_html.startsWith('<img')){
							file_icon = file_icon_html;
						}
					}
				}
				
				
				//fileItem.appendChild(img_el); //.innerHTML += '<img class="file-list-image" src="' + folder + '/' + file + '"/>';
				
				
			}
			if(file.endsWith('.svg')){
				//file_icon = '🖼️';
				file_icon = '<div class="file-list-image svg-file-list-image"><img src="./images/image_icon.svg" alt="Image" width="16" height="16"></div>';
				if(typeof file== 'string' && typeof playground_live_backups[ folder + '/' + file ] == 'string'){
					const svg_data = playground_live_backups[ folder + '/' + file ];
					//console.log("file manager icon: svg_data: ", svg_data);
					if(svg_data.startsWith('<svg')){
						
						let svg_container_el = document.createElement('div');
						file_icon = '<div class="file-list-image svg-file-list-image">' + svg_data + '</div>';
						
						/*
						let img_el = document.createElement('img');
						img_el.classList.add("file-list-image");
						img_el.src = "data:image/svg+xml;charset=utf-8," + svg_data.replaceAll('\\&quot;','\\"');
					
						//file_icon_html = img_el.outerHTML;
						//console.log("svg file_icon_html: ", file_icon_html);
						//file_icon = file_icon_html;
						file_icon = img_el.outerHTML;
						
						if(file_icon_html.startsWith('data:image/svg+xml;charset=utf-8,<svg')){
							
						}
						*/
					}
					
				}
				
			}
			if(file.endsWith('.blueprint')){
				//file_icon = '📘';
				file_icon = '<div class="file-list-image svg-file-list-image"><img src="./images/blueprint_icon.svg" alt="Blueprint" width="16" height="16"></div>';
			}
			
			if(file.endsWith('.srt')){
				//file_icon = '🎥'; // 🎥 📀
				file_icon = '<div class="file-list-image svg-file-list-image"><img src="./images/subtitle_icon.svg" alt="Subtitle" width="16" height="16"></div>';
			}
			
			let extension = get_file_extension(file);
			
			if(binary_media_extensions.indexOf(extension) != -1){
				//file_icon = '📺';
				file_icon = '<div class="file-list-image svg-file-list-image"><img src="./images/video_icon.svg" alt="Video" width="16" height="16"></div>';
				//file_icon = '<div class="file-list-image video-file-list-image"><img src="./images/media.svg" width="16" height="16" alt="Video"/></div>';
			}
			
			if(extension == 'mp3' || extension == 'wav' || extension == 'flac' || extension == 'm4a' || extension == 'ogg'){
				//media_type = 'audio';
				//file_icon = '🎵';
				file_icon = '<div class="file-list-image svg-file-list-image svg-file-list-image-audio"><img src="./images/audio_icon.svg" alt="Audio" width="16" height="16"></div>';
			}
			
			
			
			
			if(file.toLowerCase().endsWith('.zip')){
				file_icon = '📦';
				fileItem.classList.add('zip');
			}
			
			fileItem.innerHTML = '<span class="file-icon file-manager-list-icon file-icon-loaded unicode-icon">' + file_icon + '</span><span class="file-icon file-manager-list-icon file-icon-production unicode-icon" title="Production">' + file_icon + '</span>';
			
			
			let span_name_el = document.createElement('span');
			span_name_el.classList.add('file-name');
			if(file.indexOf('.') > 2){
				let file_name_extension = get_file_extension(file);
				if(file_name_extension){
					let extensionless_file_name = file.substr(0,file.lastIndexOf(file_name_extension)-1);
					span_name_el.innerHTML = '<span class="extensionless-file-name">' + extensionless_file_name + '</span><span class="file-name-extension">.' + file_name_extension + '</span>';
				}
				else{
					span_name_el.innerHTML = '<span class="extensionless-file-name">' + file + '</span>';
				}
			}
			else{
				span_name_el.innerHTML = '<span class="extensionless-file-name">' + file + '</span>';
			}
			
			
			
			fileItem.appendChild(span_name_el);
			
			if(typeof files[file]['size'] != 'undefined'){
				let filesize = files[file]['size'];
				if(filesize < 1000000){
					fileItem.innerHTML += '<span class="file-size">' + Math.round((files[file]['size']/1000) + 0.5) + 'Kb</span>';
				}
				else{
					fileItem.innerHTML += '<span class="file-size">' + Math.round((files[file]['size']/100000) + 0.5)/10 + 'Mb</span>';
				}
				
			}
			
			// add preview image at the end of the item if not serverless
			if(!serverless){
				let img_el = generate_image_html(null,folder,file,null,true); // skip updating image_to_text preview image
				if(img_el){
					img_el.classList.add("file-list-image");
					fileItem.appendChild(img_el); //.innerHTML += '<img class="file-list-image" src="' + folder + '/' + file + '"/>';
				}
			}
			
			
			// for AI chat RAG
			let rag_checkbox_container_el = document.createElement('div');
			rag_checkbox_container_el.classList.add('rag-search-document-checkbox-container');
			rag_checkbox_container_el.classList.add('assistants-checkbox-container');
			
			
			rag_checkbox_container_el.innerHTML = `<div class="assistants-checkbox">
  <span>
    <svg width="12px" height="9px" viewbox="0 0 12 9">
      <polyline points="1 5 4 8 11 1"></polyline>
    </svg>
  </span>
</div>`
			
			rag_checkbox_container_el.addEventListener('mousedown', (event) => {
				event.preventDefault();
				event.stopPropagation();
			});
			rag_checkbox_container_el.addEventListener('mouseup', (event) => {
				event.preventDefault();
				event.stopPropagation();
			});
			rag_checkbox_container_el.addEventListener('click', (event) => {
				event.preventDefault();
				event.stopPropagation();
				//console.log("file: ", file, ", folder: ", folder);
				if(typeof window.selected_rag_documents[folder + '/' + file] == 'undefined'){
					fileItem.classList.add('selected');
					window.selected_rag_documents[folder + '/' + file] = {'folder':folder,'filename':file}
				}else{
					fileItem.classList.remove('selected');
					delete window.selected_rag_documents[folder + '/' + file];
				}
				//console.log("window.selected_rag_documents is now: ", window.selected_rag_documents);
			});
			fileItem.appendChild(rag_checkbox_container_el);
			
			if(typeof window.selected_rag_documents[folder + '/' + file] != 'undefined'){
				fileItem.classList.add('selected');
			}
			
			
			
			//console.log("update_ui_file_menu: menu:  file,modified ", file, files[file]['modified']);
			if(typeof files[file]['modified'] != 'undefined' && files[file]['modified'] == true){
				//console.error("update_ui_file_menu: -----------------------------> MODIFIED: ", file);
				fileItem.classList.add('modified');
				modified_file_count++;
			}
			
			if(typeof files[file]['loaded'] != 'undefined' && files[file]['loaded'] == true){
				fileItem.classList.add('loaded');
			}
			else{
				fileItem.classList.add('unloaded');
				unloaded_file_count++;
			}
			
			if(typeof files[file]['beta'] != 'undefined' && files[file]['beta'] == true){
				fileItem.classList.add('beta');
				beta_file_count++;
			}
			else if(typeof files[file]['real'] != 'undefined' && files[file]['real'] == true){
				fileItem.classList.add('production');
			}
			
			
			
			if(typeof files[file]['real'] != 'undefined'){
				
				if(files[file]['real'] == true){
					fileItem.classList.add('real');
				}
				else{
					fileItem.classList.add('unreal');
					//console.log("unreal. playground_saved_files[folder + '/' + file]: ", playground_saved_files[folder + '/' + file]);
					//console.log("unreal. playground_live_backups[folder + '/' + file]: ", playground_live_backups[folder + '/' + file]);
				}
			}
			else{
				//console.log("update_ui_file_menu: real was not defined");
				fileItem.classList.add('unreal');
			}
			
			
			if(typeof files[file]['compression'] != 'undefined'){
				fileItem.classList.add('compression-' + files[file]['compression']);
			}
			else{
				fileItem.classList.add('compression-none');
			}
			
			
			
			
			if(serverless){
				
				if(window.settings && typeof window.settings.settings_complexity == 'string' && window.settings.settings_complexity != 'normal'){
					fileContextMenu = new ContextMenu(fileItem, [
						{text: 'Open in tab', onclick: clickHandler},
						null,
						{text: 'Copy', onclick: clickHandler},
						{text: 'Paste', onclick: clickHandler},
						{text: 'Rename', onclick: clickHandler},
						null,
						{text: 'Save', onclick: clickHandler},
						{text: 'Save as...', onclick: clickHandler},
						{text: 'Download', onclick: clickHandler},
						null,
						{text: 'Revert from save', onclick: clickHandler},
						null,
					    {text: 'Delete', onclick: clickHandler},
						null,
						{text: 'Cancel', onclick: clickHandler},
					]);
				}
				else{
					fileContextMenu = new ContextMenu(fileItem, [
						{text: 'Copy', onclick: clickHandler},
						{text: 'Paste', onclick: clickHandler},
						{text: 'Rename', onclick: clickHandler},
						null,
						{text: 'Save', onclick: clickHandler},
						{text: 'Save as...', onclick: clickHandler},
						{text: 'Download', onclick: clickHandler},
						null,
						{text: 'Revert from save', onclick: clickHandler},
						null,
					    {text: 'Delete', onclick: clickHandler},
						null,
						{text: 'Cancel', onclick: clickHandler},
					]);
				}
				
				
			}
			else{
				fileContextMenu = new ContextMenu(fileItem, [
					{text: 'Open in new window', onclick: clickHandler},
					{text: 'Open in tab', onclick: clickHandler},
					null,
					//{text: 'Unzip', onclick: clickHandler},
					{text: 'Copy', onclick: clickHandler},
					{text: 'Paste', onclick: clickHandler},
					{text: 'Rename', onclick: clickHandler},
					null,
					{text: 'Save', onclick: clickHandler},
					{text: 'Save as...', onclick: clickHandler},
					{text: 'Save to production', onclick: clickHandler},
					{text: 'Download', onclick: clickHandler},					
					null,
					{text: 'Revert from save', onclick: clickHandler},
					{text: 'Revert from disk', onclick: clickHandler},
					null,
				    {text: 'Delete', onclick: clickHandler},
					{text: 'Delete from production', onclick: clickHandler},
					null,
					{text: 'Cancel', onclick: clickHandler},
				]);
			}
			

			fileContextMenu.install();
			
			window.context_menus.push(fileContextMenu);
			
			
		}
        
        if(file == current_file_name) {
            //fileItem.className = 'current';
			fileItem.classList.add('current');
			//console.log("\nFILE IS CURRENT\n");
			
			if(typeof files[file]['modified'] != 'undefined' && files[file]['modified'] == true){
				document.body.classList.add('current-modified');
			}
			else{
				document.body.classList.remove('current-modified');
			}
			
			if(current_file_name.endsWith('.blueprint')){
				document.body.classList.add('blueprint');
			}
			else{
				document.body.classList.remove('blueprint');
			}
			setTimeout(() => {
				fileItem.scrollIntoView({ "behavior": "smooth", "block": "center"});
			},1)
			
        }
		
		
		
		fileItem.setAttribute('data-file', file);
		fileItem.setAttribute('data-folder', folder);
		
		fileItem.addEventListener('contextmenu', (e) => {
			//console.log("detected context menu on file item in menu");
			e.preventDefault();
			e.stopPropagation();
		});
		
        
		
		fileItem.onmouseup = (e) => {
  			clearTimeout(pressTimer);
			//console.log("fileItem: detected mouse up. e.target.tagName,e.target.classList:", e.target.tagName, e.target.classList);

			if(Date.now() - context_menu_mouse_down_timer > 1000 && Date.now() - context_menu_mouse_down_timer < 5000){
				//console.log("Not doing normal file opening process because long press was detected");
			}
			else{
				//let msg = codeOutput;
	            switch (e.button) {
	                case 0:
						//console.log('Left mouse button clicked on file item.');
						document.body.classList.remove('enlarge-functions');
						document.body.classList.remove('show-rewrite');
						
						// For AI chat
						if(window.innerWidth < 801){
							document.body.classList.remove('sidebar');
						}
					
						//console.log("files: ", files);
						files[file].last_time_opened = Date.now();
						localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
						/*
						const current_file_data = JSON.parse(JSON.stringify(files.splice(file_index, 1);
						//console.log("current_file_data: ", current_file_data);
						files.unshift(current_file_data);
						localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
						*/
						/*
						files.unshift();
						localStorage.setItem(folder + '_playground_files', JSON.stringify(files));
						*/
						
						document.body.classList.remove('enlarge-functions');
					
			            let target_filename = fileItem.getAttribute('data-file');
						//console.log("update_ui_file_menu: fileItem click: target_filename: ", target_filename);
						if(target_filename){
						
							current_file_name = fileItem.getAttribute('data-file');
							open_file(current_file_name);
						
				            //update_ui_file_menu();
						}
						
						// for AI chat
						window.active_section = 'sidebar';
						
						
						
						
						
	                    //msg.textContent = 'Left mouse button clicked.';
	                    break;
	                case 1:
	                    //msg.textContent = 'Middle mouse button clicked.';
	                    break;
	                case 2:
						e.stopPropagation();
	                    console.log('Right mouse button clicked on file item.');
	                    break;
	                default:
	                    //msg.textContent = `Unknown mouse button code: ${event.button}`;
	            }
			}
			
			context_menu_mouse_down_timer = 0;
			
			return false;
		}
		fileItem.onmousedown = (e) => {
			
			context_menu_mouse_down_timer = Date.now();
			
  		  	pressTimer = window.setTimeout(function() {
  		  		//console.log("long press detected on: ", fileItem.getAttribute('data-file'));
				//console.log("long press: fileContextMenu: ", fileContextMenu);
				//fileContextMenu.show();
				fileContextMenu.show(e.clientX, e.clientY, e);
				setTimeout(() => {
					fileContextMenu.show(e.clientX, e.clientY, e);
				},100)
				
  		  	},1000);
			return false; 
		};
		
		
		new_file_list_els.push(fileItem);
		//file_menu_el.appendChild(fileItem);
    }
	
	//console.log("saving folder meta counts");
	save_folder_meta('file_count',file_list.length-1);
	save_folder_meta('modified',modified_file_count);
	save_folder_meta('loaded', (file_list.length-1) - unloaded_file_count); // subtract notepad
	
	if(modified_file_count > 0){
		//console.log("update_ui_file_menu: at least one file is modified.  modified_file_count: ", modified_file_count);
		modified = true;
		if(!document.body.classList.contains('modified')){
			document.body.classList.add('modified');
		}
	}
	else{
		//console.log("update_ui_file_menu: no files are modified");
		modified = false;
		if(document.body.classList.contains('modified')){
			document.body.classList.remove('modified');
		}
	}
	
	if(modified_file_count > 1){
		if(!document.body.classList.contains('multiple-modified')){
			document.body.classList.add('multiple-modified');
		}
	}
	else{
		if(document.body.classList.contains('multiple-modified')){
			document.body.classList.remove('multiple-modified');
		}
	}
	
	//console.log("unloaded_file_count: ", unloaded_file_count);
	if(unloaded_file_count > 0){
		load_all_files_button_el.style.display = 'block';
	}
	else{
		load_all_files_button_el.style.display = 'none';
	}
	
	
	
	// FOLDERS LIST
	
	sub_folders_list = keyz(sub_folders);
	sub_folders_list = case_insensitive_sort(sub_folders_list);
	save_folder_meta('sub_folder_count',sub_folders_list.length);
	for(var f = 0; f < sub_folders_list.length; f++) {
		let folder_name = sub_folders_list[f];
		if(folder_name == 'Papeg_ai_conversations' && window.settings.settings_complexity == 'normal'){
			continue
		}
		//console.warn("update_ui_file_menu: folder_name: ", folder_name);
        const folder_item = document.createElement('li');
		folder_item.classList.add('folder-item');
		if(f==0){ folder_item.classList.add('first-folder-item') }
		folder_item.innerHTML = '<span class="folder-icon folder-icon-loaded file-manager-list-icon unicode-icon">📁</span><span class="folder-icon folder-icon-production file-manager-list-icon unicode-icon">📁</span><span class="folder-name">' + folder_name + '</span>'; // 📁
		const files_dict_path = folder + '/' + folder_name + '/' + '_playground_files';
		
		//console.log("update_ui_file_menu: files_dict_path: ", files_dict_path);
		let folder_files_dict = localStorage.getItem(folder + '/' + folder_name + '' + '_playground_files');
		
		if( folder_files_dict == null){
			folder_item.classList.add('unloaded');
		}
		else{
			//console.log("sub-folder_files_dict as string: ", folder_files_dict);
			if(folder_files_dict.indexOf('"loaded":true') != -1){
				//console.log("update_ui_file_menu: at least one file in this subfolder is loaded");
				folder_item.classList.add('loaded');
			}
			if(folder_files_dict.indexOf('"modified":true') != -1){
				//console.log("update_ui_file_menu: at least one file in this subfolder is modified");
				folder_item.classList.add('modified');
			}
		}
		
		if(typeof sub_folders[folder_name] != 'undefined'){
			if(typeof sub_folders[folder_name].real != 'undefined'){
				if(sub_folders[folder_name].real){
					folder_item.classList.add('real');
				}
				else{
					folder_item.classList.add('unreal');
				}
			}
			else{
				folder_item.classList.add('unreal');
			}
			
		}
		else{
			console.error("What how? folder name was not in sub_folders: ", folder_name, sub_folders);
		}
		
		folder_item.setAttribute('data-folder', folder + '/' + folder_name);
		//unloaded_file_count++;
		folder_item.addEventListener('mousedown', (e) => {
			//console.log("\n\n\nfolder_item: mouse down.  e.button: ", e.button);
			
            //let msg = codeOutput;
            switch (e.button) {
                case 0:
					document.body.classList.remove('enlarge-functions');
					//sidebar_tabs_el.classList.add('move-to-left');
					file_manager_el.classList.add('move-to-left');
					setTimeout(() => {
						//sidebar_tabs_el.classList.remove('move-to-left');
						file_manager_el.classList.remove('move-to-left');
					},400);
					open_folder( folder_item.getAttribute('data-folder') );
					
                    //msg.textContent = 'Left mouse button clicked.';
                    break;
                case 1:
                    //msg.textContent = 'Middle mouse button clicked.';
                    break;
                case 2:
                    console.log('Right mouse button clicked.');
                    break;
                default:
                    console.error(`Unknown mouse button code: ${event.button}`);
            }
			
		});
		folder_item.addEventListener('contextmenu', (e) => {
			//console.log("update_ui_file_menu: detected context menu");
			e.preventDefault();
			e.stopPropagation();
		});
		
		
		
		// Folder context menu clicks
		function folderClickHandler(e){
			//console.log("in folderClickHandler");
			//console.log("\n\nin folderClickHandler.  e:", e, e.event, e.label.textContent);    
		    e.event.stopPropagation();
		    e.event.preventDefault();
	
			let folderItem = e.event.target.closest('li.folder-item');
			let folder_name = '';
		
			if(folderItem!=null){
				folder_name = folderItem.getAttribute('data-folder');
			}
			else{
				console.error("folderClickHandler: folderItem was null");
				return
			}
			//console.log("folder_name: ", folder_name);
	
			if(e.label.textContent == 'Cancel'){
				//document.querySelector('.context').style.display = 'none';
			}
			
			else if(e.label.textContent == 'Delete' || e.label.textContent == 'Delete from production'){
				//console.log("clicked " + e.label.textContent + " folder. folder_name: ", folder_name);
				
				if(confirm('Are you sure you want to delete ' + folder_name + '?')){
					let short_folder_name = folder_name.split('/')[folder_name.split('/').length-1];
			
					if(typeof sub_folders[short_folder_name] != 'undefined'){
						flash_message("Deleting folder: " + short_folder_name);
						
						if(e.label.textContent == 'Delete from production'){
							delete_folder(folder_name,'production');
						}
						else{
							delete_folder(folder_name,'beta');
						}
						
                        update_ui();
                    }
					else{
						console.error("folder delete button: folder name was not in sub_folders: ", folder_name, sub_folders );
					}
				}
				
				/*
		        vex.dialog.confirm({
		            message: 'Are you sure you want to delete ' + folder_name + '?',
		            callback: function (value) {
		                if (value) {
							//console.log("delete value: ", value)
							//console.log("delete folder_name: ", folder_name);
					
							let short_folder_name = folder_name.split('/')[folder_name.split('/').length-1];
					
							if(typeof sub_folders[short_folder_name] != 'undefined'){
								flash_message("Deleting folder: " + short_folder_name);
								
								if(e.label.textContent == 'Delete from production'){
									delete_folder(folder_name,'production');
								}
								else{
									delete_folder(folder_name,'beta');
								}
								
		                        update_ui();
		                    }
							else{
								console.error("folder delete button: folder name was not in sub_folders: ", folder_name, sub_folders );
							}
		                }
		            }
		        });
				*/
		
			}
			
			// Disabled for AI chat project
			/*
			else if(e.label.textContent == 'Delete from production'){
				//console.log("clicked Delete folder from production");
				if(folder_name.length > 1){
					
			        vex.dialog.confirm({
			            message: 'Are you sure you want to delete ' + folder_name + '?',
			            callback: function (value) {
			                if (value) {
					
								//console.log("delete value: ", value)
								//console.log("delete folder_name: ", folder_name);
					
								let short_folder_name = folder_name.split('/')[folder_name.split('/').length-1];
					
								if(typeof sub_folders[short_folder_name] != 'undefined'){
									flash_message("Deleting folder: " + folder_name);
								
									//delete sub_folders[short_folder_name];
								
									update_sub_folders('remove',short_folder_name);
								
									delete_folder(folder_name,'production');
									
			                        //editor_set_value('');
			                        //files.splice(index, 1);
									//delete_file( filename_to_delete );
						
									//open_file(unsaved_file_name);
			                        //current_file_name = unsaved_file_name;
			                        update_ui();
			                    }
								else{
									console.error("folder delete button: folder name was not in sub_folders: ", folder_name, sub_folders );
								}
			                }
			            }
			        });
					
				}
				else{
					flash_message("cannot delete root folder",3000,'fail');
				}
				
			}
			*/
	
			e.handled = true;
			e.context.hide();
			return false;
		}
		
		
		
		
		let folderContextMenu;
		if(serverless){
			folderContextMenu = new ContextMenu(folder_item, [
			    {text: 'Delete', onclick: folderClickHandler},
				null,
				{text: 'Cancel', onclick: folderClickHandler},
			]);
		}
		else{
			folderContextMenu = new ContextMenu(folder_item, [
			    {text: 'Delete', onclick: folderClickHandler},
				{text: 'Delete from production', onclick: folderClickHandler},
				null,
				{text: 'Cancel', onclick: folderClickHandler},
			]);
		}
		
		
		
		
		folderContextMenu.install();
		
		new_file_list_els.push(folder_item);
		
		window.context_menus.push(folderContextMenu);
		
	}
	
	for(let d = 0; d < new_file_list_els.length; d++){
		file_menu_el.appendChild(new_file_list_els[d]);
	}
	
	update_ui_folder(); // updates the folder name above the document
	update_ui_file();
	update_ui_file_tabs();
    
}












function show_picture(target_filename=null,target_folder=null){
	if(target_folder == null){target_folder=folder}
	//console.log("in show_picture.  target_folder, target_filename: ", target_folder, target_filename);
	if(target_filename == null){
		console.error("show_picture: invalid file name: ", target_filename);
		return
	}
	
	if(keyz(files).includes(target_filename)){
		let current_file_path = target_folder + '/' + target_filename;
		//console.log("show_picture: current_file_path: ", current_file_path);
		open_dialog_overlay('<img src="' + current_file_path + '"/>');
	}
	else{
		console.error("show_picture: image name not found in current directory: ", target_filename, files);
	}
	
}










// updates all the parts of the UI that need to happen when a new file is loaded/created
function update_ui_file(){	
	if(current_file_name == unsaved_file_name){
		document.getElementById('current-file-name').textContent = 'Notepad';
		document.body.classList.add('notepad');
	}
	else{
		document.getElementById('current-file-name').textContent = current_file_name;
		document.body.classList.remove('notepad');
	}
}




// updates all the parts of the UI that need to happen when a new folder is loaded/created
function update_ui_folder(){
	//console.log("in update_ui_folder.  \n- folder: ", folder, "\n- window.settings.docs.open: ", JSON.stringify(window.settings.docs.open,null,2) , " \n- folder_parts: ", JSON.stringify(folder_parts,null,2) , "\n- files: ", JSON.stringify(files,null,2).substr(0,120));
	current_folder_el.innerHTML = '';
	let path_so_far = '';
	
	if(document.body.classList.contains('has-tabs')){
		//console.log("update_ui_folder: has-tabs, so creating simple folder path element.  typeof window.settings.docs.open.folder: ", window.settings.docs.open.folder);
		let path_el = document.createElement('span');
		path_el.setAttribute('data-folder','');
		path_el.textContent = '';
		if(window.settings.docs.open != null && typeof window.settings.docs.open.folder == 'string'){
			path_el.textContent = window.settings.docs.open.folder;
			path_el.setAttribute('data-folder',window.settings.docs.open.folder);
			console.log("update_ui_folder: folder comparison: ", window.settings.docs.open.folder, " =?= ", folder);
			if(window.settings.docs.open.folder != folder){
				open_folder(window.settings.docs.open.folder);
			}
			
		}
		path_el.onclick = () =>{
			//console.log("clicked on path element. path_so_far: ", path_el.getAttribute('data-folder'));
			open_folder(path_el.getAttribute('data-folder'));
		}
		current_folder_el.appendChild(path_el);
		
	}
	else{
		for(var n = 0; n < folder_parts.length; n++) {
			let path_el = document.createElement('span');
			path_so_far += folder_parts[n];
		
		
			if(n == 0 && folder_parts[n] == ''){
				path_el.textContent = ''; // ☗⛺
				path_el.setAttribute('data-folder','');
			}
			else{
				path_el.textContent = folder_parts[n];
				path_el.setAttribute('data-folder',path_so_far);
			}
		
			path_el.onclick = () =>{
				console.log("clicked on path element. path_so_far: ", path_el.getAttribute('data-folder'));
				open_folder(path_el.getAttribute('data-folder'));
			}
		
			current_folder_el.appendChild(path_el);
			path_so_far += '/';
		}
	}
	
	
}




// Context menu clicks
const clickHandler = e => {
	console.log("\n\nin clickHandler.  e:", e, e.event, e.label.textContent);
	console.log("e.label.innerHTML: -->" +  e.label.innerHTML + "<--");
    e.event.stopPropagation();
    e.event.preventDefault();
	let fileItem = e.event.target.closest('li.file-item');
	
	try{
		
		let filename = 'error';
		let folder_name = '';
		try{
			if(fileItem!=null){
				//filename = e.event.target.closest('li.file-item').childNodes[2].textContent;
				filename = fileItem.getAttribute('data-file');
				folder_name = fileItem.getAttribute('data-folder');
			}
		}
		catch(e){
			console.error("context menu: unable to find filename");
		}
	
		
		//e.preventDefault();
		if(e.label.textContent == 'Cancel'){
			//console.log("clicked on context menu cancel");
			//document.querySelector('.context').style.display = 'none';
			e.context.hide();
		}
	
	
	
		// New file
		
		else if(e.label.textContent == 'From URL'){
			let ask_for_url_dialog_el = document.getElementById('ask-for-url-dialog');
			if(ask_for_url_dialog_el){
				ask_for_url_dialog_el.showModal();
			}
			ask_for_url_dialog_image_el.classList.add('hidden');
			
			//suggested_filename = 'my_automation.blueprint';
			//create_file(false,blueprint_boilerplate);
			//save_file('index.html',html5_boilerplate);
		}
		
		else if(e.label.textContent == 'Blueprint'){
			suggested_filename = 'my_automation.blueprint';
			create_file(false,blueprint_boilerplate);
			//save_file('index.html',html5_boilerplate);
		}
	
		else if(e.label.textContent == 'HTML Boilerplate'){
			suggested_filename = 'index.html';
			create_file(false,html5_boilerplate);
			//save_file('index.html',html5_boilerplate);
		}
		
		else if(e.label.textContent == 'JS Boilerplate'){
			suggested_filename = 'javascript.js';
			create_file(false,js_boilerplate);
			//save_file('index.html',html5_boilerplate);
		}
		
		else if(e.label.textContent == 'CSS Boilerplate'){
			suggested_filename = 'style.css';
			create_file(false,css_boilerplate);
			//save_file('index.html',html5_boilerplate);
		}
		
		else if(e.label.textContent == 'Empty image'){
			suggested_filename = 'empty_image.png';
			const empty_image_as_array = decodeURIComponent(empty_image_encoded);
			//console.log("empty_image_as_array: ", empty_image_as_array);
			//const empty_image_as_array2 = string_to_buffer(empty_image_as_array);
			//console.log("empty_image_as_array2: ", empty_image_as_array2);
			create_file(false,empty_image_as_array);
		
			//save_file('index.html',html5_boilerplate);
		}
	
	
		// save file
		
		
		else if(e.label.textContent == 'TEXT'){
			//create_file(false,blueprint_boilerplate);
			//save_file('index.html',html5_boilerplate);
			if(typeof folder == 'string' && typeof current_file_name == 'string'){
				//console.log("context menu -> calling window.download_text_as_pdf");
				window.download_text_as_txt(playground_live_backups[ folder + '/' + current_file_name ]);
			}
		}
		
		else if(e.label.textContent == 'MD'){
			//create_file(false,blueprint_boilerplate);
			//save_file('index.html',html5_boilerplate);
			if(typeof folder == 'string' && typeof current_file_name == 'string'){
				//console.log("context menu -> downloading currently open file as Markdown");
				window.download_text_as_md(playground_live_backups[ folder + '/' + current_file_name ]);
			}
		}
		
		else if(e.label.textContent == 'PDF'){
			//create_file(false,blueprint_boilerplate);
			//save_file('index.html',html5_boilerplate);
			if(typeof folder == 'string' && typeof current_file_name == 'string'){
				//console.log("context menu -> calling window.download_text_as_pdf");
				window.download_text_as_pdf(playground_live_backups[ folder + '/' + current_file_name ]);
			}
		}
	
		else if(e.label.textContent == '✉️ Email'){
			//create_file(false,blueprint_boilerplate);
			//save_file('index.html',html5_boilerplate);
			if(typeof folder == 'string' && typeof current_file_name == 'string'){
				//console.log("context menu -> calling window.text_to_email");
				window.text_to_email(playground_live_backups[ folder + '/' + current_file_name ]);
			}
		}
		else if(e.label.innerHTML.startsWith('<img src="./images/copy_to_clipboard.svg" width="16" height="16" alt="Copy"')){
			//create_file(false,blueprint_boilerplate);
			//save_file('index.html',html5_boilerplate);
			if(typeof folder == 'string' && typeof current_file_name == 'string'){
				//console.log("context menu -> calling window.text_to_email");
				window.text_to_clipboard(playground_live_backups[ folder + '/' + current_file_name ]);
			}
		}
		else if(e.label.innerHTML.startsWith('<img src="./images/share.svg" width="16" height="16" alt="Share"')){
			console.log("clicked on share option");
			if(typeof folder == 'string' && typeof current_file_name == 'string'){
				console.log("context menu -> calling share_document");
				share_document();
			}
		}
		
	
	
		else if(e.label.textContent == 'Open in new window'){
			let path = folder_name + '/' + filename;
			let url = window.location.href.split('/playground')[0] + path;
			window.open(url,'_blank');
		}
	
		else if(e.label.textContent == 'Open in tab'){
			add_file_tab(filename); // ;.textContent.substr(2)
			save_file();
		}
		
		else if(e.label.textContent == 'Unzip'){
			//console.log("unzip context menu selected");
		}
	
		else if(e.label.textContent == 'Save'){
			//console.log("file context menu: chose save.  filename: ", filename);
			if(typeof filename == 'string' && typeof playground_live_backups[ folder + '/' + filename ] != 'undefined'){
				save_file(filename, playground_live_backups[ folder + '/' + filename ]);
			}
			else{
				
				load_file_from_outside(folder,filename,'save')
				.then((value) => {
					//console.log("context menu save: load_file_from_outside and then save it succesful.  value: ", value);
				})
				.catch((err) => {
					flash_message("could not save file, missing data.",2000,'fail');
					console.error("context menu save: caught load_file_from_outside error: ", err);
				})
			}
		}
	
		else if(e.label.textContent == 'Save as...' || e.label.textContent == 'Rename'){
			let original_filename = filename;
			if(typeof original_filename == 'string'){
				suggested_filename = original_filename;
				
				if(e.label.textContent != 'Rename'){
					suggested_filename = suggested_filename + '_copy_' + makeid(3);
				}
				
				//console.log("suggested_filename: ", suggested_filename);
				if(typeof playground_live_backups[ folder + '/' + original_filename ] != 'undefined'){
					create_file(false, playground_live_backups[ folder + '/' + original_filename ] )
					.then((value) => {
						
						if(e.label.textContent == 'Rename'){
							//console.log("Renaming, so should now delete old file");
							if(typeof files[original_filename].real != 'undefined' && files[original_filename].real == false){
								//console.log("deleting original non-real file");
								setTimeout(() => {
									update_ui();
								},500);
								return delete_file(original_filename);
							}
						}
						else{
							//console.log("Save as - done");
							
						}
						return true;
						
					})
					.then((value) => {
						//console.log("rename. value: ", value);
					})
					.catch((err) => {
						console.error("create_file.catch: ", err);
					});
					
				}
				else{
					console.error("Save as: no data in playground_live_backups: ", folder + '/' + original_filename, playground_live_backups );
					if(typeof files[original_filename] != 'undefined'){
						open_file(original_filename)
						.then(function(value) {
							//console.log("save_as: had to first open the file. Value: ", value, playground_live_backups[ folder + '/' + original_filename ]);
						
							if(value != null){
								return create_file(false, value );
							}
							else{
								reject(value);
								return value;
							}
							
						})
						.then((value) => {
							//console.log("Save as - create file done. value: ", value);
							
							if(value && e.label.textContent == 'Rename'){
								if(files[original_filename].real == false){
									//console.log("deleting original non-real file");
									return delete_file(original_filename);
								}
								else{
									console.warn("original file was a real file. Currently not deleting the real file.");
									return false;
								}
							}
							
						})
						.then((value) => {
							//console.log("Save as -> rename -> delete old file done. value: ", value);
							flash_message("File renamed");
						})
						.catch(function(err) {
							console.error("save_as/rename: caught error: ", err);
						});
					}
			
				}
			}
		}
		
		
		else if(e.label.textContent == 'Download'){
			if(typeof filename == 'string' && typeof playground_live_backups[ folder + '/' + filename ] != 'undefined'){
				let data = playground_live_backups[ folder + '/' + filename ];
				
				download(filename,data);
				
			}
		}
		
		
	
		else if(e.label.textContent == 'Save to production'){
			//console.log("file context menu: chose save to production.  filename: ", filename);
			if(typeof filename == 'string' && typeof playground_live_backups[ folder + '/' + filename ] != 'undefined'){
				save_file(filename, playground_live_backups[ folder + '/' + filename ],'production',folder,true)
				.then((value) => {
					//console.log("Save to production done.  value: ", value);
					flash_message("File saved to production");
					update_ui();
				})
				.catch(function(err) {
					flash_message("Error saving file to production", 3000, 'fail');
					console.error("save to production: caught error: ", err);
				});
			}
			else{
				console.error("save to production: not in playground_live_backups? (or not a string): ", folder + '/' + filename);
				flash_message("could not save file to production, missing data.",2000,'fail');
			}
		}
	
		else if(e.label.textContent == 'Copy'){
			let original_filename = filename;
			if(typeof original_filename == 'string'){
				suggested_filename = original_filename;
				//console.log("suggested_filename: ", suggested_filename);
				if(typeof playground_live_backups[ folder + '/' + original_filename ] != 'undefined'){
					copy_to_clipboard(playground_live_backups[ folder + '/' + original_filename ],'file');
					//create_file(false, playground_live_backups[ folder + '/' + original_filename ] );
				}
				else{
					console.error("copy: no data in playground_live_backups: ", folder + '/' + original_filename, playground_live_backups );
					if(typeof files[original_filename] != 'undefined'){
						open_file(original_filename)
						.then(function(value) {
							//console.log("copy: had to first open the file. Value: ", value, playground_live_backups[ folder + '/' + original_filename ]);
						
							if(value != null){
								copy_to_clipboard(value,'file');
								//create_file(false, value );
							}
							/*
							if(typeof playground_live_backups[ folder + '/' + original_filename ] != 'undefined'){
								create_file(false, playground_live_backups[ folder + '/' + original_filename ] );
							}
							*/
							//console.error("\n\n\n\n\nopen_folder: in  open_file().then, HURRAY.  current_file_name: ", current_file_name); //  value: ", value
							//update_ui();
						})
						.catch(function(err) {
							console.error("copy: caught open_file.then error: ", err);
						});
					}
			
				}
			}
		}
		else if(e.label.textContent == 'Paste'){
		  	navigator.clipboard.readText()
		    .then((clipText) => {
				create_file(false, clipText );
		    });
		}
		
		else if(e.label.textContent == 'Revert from save'){
			diffing = true;
			open_file(filename,'saved',folder)
			.then((value) => {
				//console.log("revert from save almost done. value: ", value);
				playground_live_backups[folder + '/' + filename] = value;
				savr(folder + '/playground_backup_' + filename, value);
			})
			.catch((err) => {
				console.error("caught error in open_file in Revert from save")
			})
			save_file_meta('modified',false);
		}
	
		else if(e.label.textContent == 'Revert from disk'){
			//console.log("filename to Revert from disk: ",filename);
			diffing = true;
			open_file(filename,'outside');
			//load_file_from_outside(folder,filename);
			save_file_meta('modified',false);
			save_file_meta('beta',false);
		}
	
		else if(e.label.textContent == 'Delete'){
			let filename_to_delete = filename;
			//console.log("Delete chosen. filename_to_delete: ", filename_to_delete);
		
			if(confirm('Are you sure you want to delete ' + filename_to_delete + '?')){
				if(typeof files[filename_to_delete] != 'undefined'){
                    //editor_set_value('');
                    //files.splice(index, 1);
					delete_file( filename_to_delete );
				
					open_file(unsaved_file_name);
                    current_file_name = unsaved_file_name;
                    update_ui();
                }
				else{
					console.error("deleteBtn: value was not in files: ", value );
				}
			}
			/*
	        vex.dialog.confirm({
	            message: 'Are you sure you want to delete ' + filename_to_delete + '?',
	            callback: function (value) {
	                if (value) {
						//let file_name = fileItem.getAttribute('data-file');
						//console.log("delete value: ", value)
						//console.log("delete data-file: ", filename_to_delete);
	                    //const index = keyz(files).indexOf(fileItem.getAttribute('data-file'));
	                    //if (index > -1) {
						if(typeof files[filename_to_delete] != 'undefined'){
	                        //editor_set_value('');
	                        //files.splice(index, 1);
							delete_file( filename_to_delete );
						
							open_file(unsaved_file_name);
	                        current_file_name = unsaved_file_name;
	                        update_ui();
	                    }
						else{
							console.error("deleteBtn: value was not in files: ", value );
						}
	                }
	            }
	        });
			*/
		}
		else if(e.label.textContent == 'Delete from production'){
			let filename_to_delete = filename;
			//console.log("Delete chosen. filename_to_delete: ", filename_to_delete);
		
			if(confirm('Are you sure you want to delete ' + filename_to_delete + ' from production?')){
				if(typeof files[filename_to_delete] != 'undefined'){
                    //editor_set_value('');
                    //files.splice(index, 1);
					delete_file( filename_to_delete,'production');
				
					open_file(unsaved_file_name);
                    current_file_name = unsaved_file_name;
                    update_ui();
                }
				else{
					console.error("deleteBtn: value was not in files: ", value );
				}
			}
			/*
	        vex.dialog.confirm({
	            message: 'Are you sure you want to delete ' + filename_to_delete + ' from production?',
	            callback: function (value) {
	                if (value) {
						//let file_name = fileItem.getAttribute('data-file');
						//console.log("delete value: ", value)
						//console.log("delete data-file: ", filename_to_delete);
	                    //const index = keyz(files).indexOf(fileItem.getAttribute('data-file'));
	                    //if (index > -1) {
						if(typeof files[filename_to_delete] != 'undefined'){
	                        //editor_set_value('');
	                        //files.splice(index, 1);
							delete_file( filename_to_delete,'production');
						
							open_file(unsaved_file_name);
	                        current_file_name = unsaved_file_name;
	                        update_ui();
	                    }
						else{
							console.error("deleteBtn: value was not in files: ", value );
						}
	                }
	            }
	        });
			*/
		}
	}
	catch(err){
		console.error("cought error in handling context menu: ", err);
	}
	
	e.handled = true;
	e.context.hide();
	return false;
}

// new file context menu
const new_file_context_menu = new ContextMenu(new_file_button_el, [
	{text: 'From URL', onclick: clickHandler},
	{text: 'Blueprint', onclick: clickHandler},
    {text: 'HTML Boilerplate', onclick: clickHandler},
	{text: 'CSS Boilerplate', onclick: clickHandler},
	{text: 'JS Boilerplate', onclick: clickHandler},
	{text: 'Empty image', onclick: clickHandler},
	{text: 'Cancel', onclick: clickHandler},
]);

new_file_context_menu.install();
window.context_menus2.push(new_file_context_menu);

new_file_button_el.addEventListener('contextmenu', (e) => {
	//console.log("detected context menu right mouse button click on new file button");
	e.preventDefault();
});


// file manager context menu
const file_manager_context_menu = new ContextMenu(file_manager_el, [
	{text: 'Paste', onclick: clickHandler},
	{text: 'Cancel', onclick: clickHandler}
]);
file_manager_context_menu.install();
window.context_menus2.push(file_manager_context_menu);

file_manager_el.addEventListener('contextmenu', (e) => {
	//console.log("detected context menu on file_manager_el");
	e.preventDefault();
});


//console.log("adding new download context menu to: download_document_button_el: ", download_document_button_el);

// download file context menu
const download_file_context_menu = new ContextMenu(download_document_button_el, [
	{text: 'TEXT', onclick: clickHandler},
	{text: 'PDF', onclick: clickHandler},
	{text: 'MD', onclick: clickHandler},
	null,
	{text: '✉️ Email', onclick: clickHandler},
	{text: '<img src="./images/copy_to_clipboard.svg" width="16" height="16" alt="Copy"> Copy', onclick: clickHandler},
	{text: '<img src="./images/share.svg" width="16" height="16" alt="Share"> Share', onclick: clickHandler},
	null,
	{text: 'Cancel', onclick: clickHandler},
]);

download_file_context_menu.install();
window.context_menus2.push(download_file_context_menu);

download_document_button_el.addEventListener('contextmenu', (e) => {
	//console.log("detected context menu right mouse button click on new file button");
	e.preventDefault();
});


download_document_button_el.addEventListener("click", (e) => {
	//download_currently_open_file();
	hide_all_context_menus();
	download_file_context_menu.show(e.clientX, e.clientY, e);
});



function hide_all_context_menus(){
	//console.log("in hide_all_context_menus");
	for(var c = 0; c < window.context_menus.length; c++) {
		window.context_menus[c].hide();
	}
	for(var c = 0; c < window.context_menus2.length; c++) {
		window.context_menus2[c].hide();
	}
	//window.context_menus = [];
}



function update_ui_function_list(){
	//console.log("in update_ui_function_list");
	let strict_function_lines = {};
	let function_lines = {};
	
	/*
	let strict_lines = code.split(/\r?\nfunction /);
	for(let s=0; s < strict_lines.length; s++){
		if(strict_lines[s].substr(0,30).indexOf('(') != -1){
			strict_function_lines[ strict_lines[s].split('(').trim() ] = 
		}
	}
	*/
	let code_lines = code.split(/\r?\n/);
	
	
	
	for(let r=0; r < code_lines.length; r++){
		let line = code_lines[r];
		
		if(line.toLowerCase().startsWith('function ') && line.indexOf('(') != -1){
			let func_line = line.split('(')[0].substr(9);
			if(typeof strict_function_lines[func_line] == 'undefined'){
				strict_function_lines[ func_line ] = r+1;
			}
			
		}
		continue // CHANGED disabled the more complicated function parsing below
		
		let comment_index = line.indexOf('//');
		let bracket_index = line.indexOf('{');
		
		if(bracket_index > 10){
			
			if(comment_index > bracket_index){
				line = line.split('//')[0];
			}
			line = line.trim();
			if( line.endsWith('{') && !line.startsWith(' ') && !line.startsWith('\t') && !line.startsWith('//')){
				if (/\t/.test(line[0])) {
					
				}
				else{
					if(line.indexOf('function') != -1 || line.indexOf('=>') != -1){
						line = line.replace('function',' ');
						line = line.replace('{',' ');
						line = line.replace('=>',' ');
						line = line.replace('=',' ');
						line = line.replace('(e)',' ');
						line = line.replace('(event)',' ');
						line = line.replace('document.getElementById',' ');
						line = line.replace('addEventListener',' ');
						line = line.replace('.',' ');
						line = line.trim();
						//if(line.replace(/\(.*?\)/g, "").length > 5){
							//line = line.replace(/\(.*?\)/g, "");
						//}
						
						line = line.replaceAll('(',' ');
						line = line.replaceAll(')',' ');
						line = line.replaceAll('"','');
						line = line.replaceAll("'","");
						line = line.trim();
						if(line.length > 0){
							
							function_lines[line] = r+1;
							//if(true_function){
								//strict_function_lines[line] = r+1;
							//}
							
						}
						
					}
				}
			}
		}
	}
	
	update_function_list(strict_function_lines);
	//if(keyz(function_lines).length > 30){
	//	function_lines = strict_function_lines;
	//}
	
	
	
}



function update_ui_css_list(){
	//console.log("in update_ui_css_list");
	const regexp = /([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g;
    
	let strict_function_lines = {};
	let function_lines = {};
	
	let code_lines = code.split(/\r?\n/);
	//console.log("css:  code_lines: ", code_lines);
	for(let r=0; r < code_lines.length; r++){
		let line = code_lines[r];
		
		if(line.startsWith('/* ') && line.endsWith(' */') && line.indexOf('{' == -1) && line.indexOf('}' == -1)){
			
			let func_line = line.substr(3);
			func_line = func_line.substr(0,func_line.length - 3);
			func_line = func_line.trim();
			//console.log("css sub-header: ", r+1, line);
			if(typeof strict_function_lines[func_line] == 'undefined'){
				strict_function_lines[ func_line ] = r+1;
			}
		}
	}
	
	if(keyz(strict_function_lines).length > 2){
		update_function_list(strict_function_lines);
	}
	else{
		if(keyz(strict_function_lines).length < 2){
			console.warn("did not find many comment sub-titles in CSS. Will try regex.");
			for(let r=0; r < code_lines.length; r++){
				let line = code_lines[r];
				if(line.indexOf('{') > 2){
					const matches = code.matchAll(line);
					//console.log("css line matches: ", matches);
					for (let match of matches) {
						//console.log("CSS match: ", match);
						if(typeof match[0] != 'undefined'){
							match = match[0].substr(0,1) + match[0].trim().substr(1).split(":.{,")[0];
							//console.log("CSS match trimmed: ", match);
							if(typeof function_lines[match] == 'undefined'){
								function_lines[match] = r+1;
							}
						}
					
					}
				}
				
			}
			if(keyz(function_lines).length > 2){
				update_function_list(function_lines);
			}
		}
	}
}


//
//  CLIPBOARD
//

let show_clipboard_history = false;
function toggle_clipboard_history(){
	if(show_clipboard_history){
		show_clipboard_history = false;
		document.body.classList.remove('clipboard');
		codeOutput.innerHTML = '';
	}
	else{
		show_clipboard_history = true;
		document.body.classList.add('clipboard');
		update_ui_clipboard_history();
	}
}


function update_ui_clipboard_history(){
	//console.log("in update_ui_clipboard_history");
	let stored_clipboard = localStorage.getItem('_playground_clipboard_text_array');
	if(stored_clipboard != null){
		clipboard_text_array = JSON.parse(stored_clipboard);
	}
	
	if(show_clipboard_history == true){
		codeOutput.innerHTML = '';
		if(clipboard_text_array.length){
			for (var i = 0; i < clipboard_text_array.length; i++){
		
				if(typeof clipboard_text_array[i] == 'string'){
			
					let clip_el = document.createElement('div');
					//let clip_text = clipboard_text_array[i];
					clip_el.classList.add("clipboard-item");
					clip_el.setAttribute('data-text',clipboard_text_array[i]);
					let clip_label = clipboard_text_array[i];
					if(clip_label.length > 20){
						clip_label = clip_label.substr(0,17) + '...';
					}
					clip_el.textContent = clip_label;
			
					clip_el.onclick = (event) => {
						//console.log("clicked on clipboard item:  data-text: ", event.target.getAttribute('data-text'));
				
						let data_text = event.target.getAttribute('data-text');
						if(data_text == null){
							console.error("data_text was null");
							return
						}
						let anchor = 0;
						let header = 0;
				
						if(current_selection != null){
							//console.log("current_selection: ", current_selection);
						}
					
						editor.dispatch({
							changes: {from: anchor, insert: data_text},
						  	selection: {anchor: anchor + data_text.length}
						})
				
					}
					//console.log("created clip_el: ", clip_el);
					codeOutput.appendChild(clip_el);
				}
			}
			let erase_clips_el = document.createElement('div');
			erase_clips_el.classList.add("clipboard-item");
			erase_clips_el.classList.add("erase-clipboard-item");
			erase_clips_el.textContent = 'Erase clipboard history';
			erase_clips_el.onclick = (event) => {
				//console.log("clicked on erase_clips_el item");
				clipboard_text_array = [];
				localStorage.setItem('_playground_clipboard_text_array',JSON.stringify(clipboard_text_array));
				codeOutput.innerHTML = '';
			}
			codeOutput.appendChild(erase_clips_el);
		}
	}
}






function update_function_list(function_lines=null){
	//console.log("in update_function_list.  function_lines: ", function_lines);
	function_index_el.innerHTML = '';
	let cm_scroller_el = document.querySelector('.cm-scroller');
	if(cm_scroller_el){
		if(cm_scroller_el.scrollHeight < (cm_scroller_el.clientHeight * 2)){
			//console.warn("no need to create function shortcuts, it's a very short file");
			document.body.classList.remove('enlarge-functions');
			return
		}
	
		if(!current_file_name.endsWith('.js') && !current_file_name.endsWith('.py')){
			//console.log("Not generating functions list since the file is not .js or .py")
			return
		}
	}
	else{
		console.error("update_function_list: no cm_scroller_el. Aborting.");
		return
	}
	
	
	
	
	
	if(typeof function_lines == 'object' && function_lines != null){
		
		let gutter_els = document.querySelectorAll('.cm-gutterElement');
		
		for (const[line, line_nr] of Object.entries(function_lines)) {
		
			for(var n = 0; n < gutter_els.length; n++) {
				//console.log("gutter_els: ", gutter_els[n].textContent, ' =?= ', line_nr);
				if(gutter_els[n].textContent == '' + line_nr){
					//console.log("adding function-line class to gutter_el nr: ", n);
					gutter_els[n].classList.add('function-line');
				}
			}
			
			let function_line_el = document.createElement('div');
			function_line_el.classList.add('function-shortcut');

			let function_span_el = document.createElement('span');
			function_span_el.classList.add('function-shortcut-name');
			function_span_el.textContent = line;
			function_line_el.appendChild(function_span_el);

			let function_line_nr_el = document.createElement('span');
			function_line_nr_el.classList.add('function-line-nr');
			function_line_nr_el.textContent = line_nr;
			function_line_el.appendChild(function_line_nr_el);

			function_line_el.setAttribute('data-line-nr', line_nr);
			function_line_el.onclick = () => {
				
				if(function_index_el.scrollHeight > function_index_el.clientHeight){
					document.body.classList.add('enlarge-functions');
				}
				let target_line = function_line_el.getAttribute('data-line-nr');
				scroll_to_line(target_line);
				//console.log("target_line: ", target_line);
			}
			function_index_el.appendChild(function_line_el);
		}
	}
}






// resize code output
resizeHandle.addEventListener('mousedown', initDrag, false);

let startX, startWidth;
function initDrag(e) {
    startX = e.clientX;
	//console.log("initDrag: startX: ", startX);
    startWidth = parseInt(document.defaultView.getComputedStyle(codeOutput).width, 10);
	//console.log("initDrag: startWidth: ", startWidth);
    document.documentElement.addEventListener('mousemove', doDrag, false);
    document.documentElement.addEventListener('mouseup', stopDrag, false);
}

function doDrag(e) {
	let new_width = (startWidth - e.clientX + startX);
	
	if(new_width < 125){
		new_width = 125;
	}
	//console.log("new_width: ", new_width);
    codeOutput.style.width = new_width + 'px';
	codeOutput.style['min-width'] = new_width + 'px';
	//console.log("codeOutput.style.width: ", codeOutput.style.width,  e.clientX);
}

function stopDrag(e) {
	//console.log("stopdrag");
	//console.log("stopdrag: codeOutput.style.width: ", codeOutput.style.width,  e.clientX);
	localStorage.setItem('_playground_code_output_width',startWidth - e.clientX + startX);
    document.documentElement.removeEventListener('mousemove', doDrag, false);
    document.documentElement.removeEventListener('mouseup', stopDrag, false);
}



const special_colors = ['info','red','purple','yellow','orange','black','white','green','ok','note','error','ok','alert'];

function add_to_output(message){
	//console.log("in add_to_output. Message: ", message);
    if(arguments.length > 1 && typeof arguments[0] == 'object' && Array.isArray(arguments[0]) && arguments[0].length > 1){
    	message = {'type':'log','arguments':arguments[0]};
    }
    else if(typeof message == 'string'){
        message = {'type':'log','arguments':[message]}; // {'message':message}
    }
    
    output_message_count++;
    //console.log("add_to_output: output_message_count: ", output_message_count);
    if(output_message_count > output_message_limit){
		if(output_message_count == output_message_limit + 1){
			alert("Received more than 1000 messages from the code. Is it stuck in a loop?");
		}
		
        return;
    }
    
    let output = '';
    
	if(message.type == 'end_of_code' && codeOutput.innerHTML == ''){
		//console.log("reached end of code, but there was no output yet, so not showing that message");
		return
	}
	else if(message.type == 'end_of_code'){
		message.type = 'meta';
	}
	else{
		message.type = 'info';
	}
    
	
	
    try{
    	//console.log("add_to_output: message.type: ", message.type);
        
        let args = message.arguments;
    
        if(color_added > 0){
            //console.warn("at the start of the fake console.log color_added was more than zero");
            //output += '</div>';
            color_added--;
        }
    
        if(!Array.isArray(args)){
            console.error("add_to_output: args was not an array? ", typeof args, args);
            
            if(typeof args == 'string'){
                args = [args]; // never happens
            }
            else if(typeof args == 'object'){
                args = Object.values(args);
            }
        }
        if(Array.isArray(args)){
            console.log("add_to_output: args is array: ", args);
            if(typeof args[0] == 'string' && message.type == 'log'){
                console.log("add_to_output: might_change_message_color: ", args[0].toLowerCase());
                if(special_colors.includes(args[0].toLowerCase())){
                    message.type = args[0].toLowerCase();
                    //console.log("message.type is now: ", message.type);
                    args[0] = '<span class="message-type">' + args[0] + '</span> ';
                }
            }
            
            for(let m = 0; m < args.length; m++){
                //console.log("add_to_output: looping over console argument: ", typeof args[m], args[m]);
                
                if(typeof args[m] == 'boolean'){
                    output += " " + args[m].toString() + " ";
                }
                else if(typeof args[m] == 'number'){
                    output += " " + args[m] + " ";
                }
                else if(typeof args[m] == 'string'){
                    //console.warn("add_to_output: args[m]: >" + args[m] + "<");
                    //value[m] = value[m].replace(/(?:\r\n|\r|\n)/g, '<br/>');
                    //let raw_string = args[m].replace(/(?:\r\n|\r|\n)/g, '<br/>') ;
                    if(color_keys.indexOf(args[m]) != -1){
                        color_added += 1;
                        //output += '<pre class="' + args[m].substring(1) + '">';
                    }
                
                    else{
                        output += args[m].replace(/(?:\r\n|\r|\n)/g, '<br/>'); // + '<br/>';
                    }
    
                }
                else if(typeof args[m] == 'object'){
                    let array_class = "object";
                    if(Array.isArray(args[m])){
                        array_class = "array";
                    }
                    //console.log("add_to_output: array_class: ", array_class);
                    //value[m] = '<pre>' + JSON.stringify(value[m], undefined, 2) + '</pre>';
                    output += '<pre class="' + array_class + '">' + JSON.stringify(args[m], null, 2) + '</pre>'; + '<br/>';
                }
            }

            if(color_added > 0){
                //console.warn("at the end of the fake console.log color_added was more than zero");
                for(let c = 0; c < color_added; c++){
                    //console.warn("closing divs");
                    //output += '</pre>';
                    color_added--;
                }
                //color_added = 0;

            }
        }
        if(message.type == 'alert'){
            //console.log("message.type is alert");
            alert_counter++;
            //console.log("add_to_output: alert_counter: ", alert_counter);
            document.getElementById('alert').style.display = 'block';
            document.getElementById('alert' + alert_counter).innerHTML = '<pre class="' + message.type + '">' + output + '</pre>';
            if(alert_counter > 1){
                alert_counter = 0;
            }
        }
        else{
            if(output != ''){
				//console.log("add_to_output: adding output: ", output);
                let add_to_output_el = document.createElement('pre');
                add_to_output_el.classList.add(message.type);
                add_to_output_el.innerHTML = output;
                codeOutput.appendChild(add_to_output_el);
            }
			else{
				console.warn("add_to_output: output was empty string");
			}
            //'<pre class="' + message.type + '">' + output + '</pre>';
        }
        
    }
    catch(e){
        console.error("error in add_to_output : ", e); // , ',  arguments: ', args
    }
}



function add_error_to_output(selection=null, error_line=null, error_message, type='error',more={}){
	//console.log("in add_error_to_output.  selection,error_line,error_message,type: ", selection,error_line,error_message,type);
    let error_message_el = document.createElement('div');
	error_message_el.classList.add("code-output-item");
	
	let target_folder = null;
	let target_filename = null;
	let search_results = null;
	
	if(error_line != null){
		error_message_el.setAttribute('data-lineNumber', error_line);
		if(type=='error'){
			error_message_el.innerHTML = 'ERROR<br><span class="error-substring" data-lineNumber=" + error_line + ">' + error_line + '</span><br/> '+ error_message;
			error_message_el.classList.add('error-message-link');
		}
		else{
			error_message_el.innerHTML = '<span class="search-all-result-line-nr" data-lineNumber=" + error_line + ">' + error_line + '</span><span class="search-all-result-line"> ' + error_message + '</span>';
			error_message_el.classList.add('search-message-link');
		}
	}
	
	else if(typeof more != 'undefined' && more !=null && typeof more.match == 'number'){
		
		let filename_html = '';
		let index_nr = '';
		if(typeof more.index == 'string' || typeof more.index == 'number'){
			index_nr = more.index
		}
		if(typeof more.search_results != 'undefined'){
			search_results = more.search_results;
		}
		
		if(typeof more.folder == 'string' && typeof more.filename == 'string'){
			target_folder = more.folder;
			target_filename = more.filename;
			filename_html = '<div class="code-output-item-file">'
			if(target_folder != folder){
				filename_html += '<span class="code-output-item-file-folder">' + target_folder + '/</span>';
			}
			
			filename_html += '<span class="code-output-item-file-filename">' + target_filename + '/</span>';
			filename_html += '</div>';
		}
		
		error_message_el.innerHTML = '<div><div class="code-output-item-index">' + index_nr + '</div><div class="code-output-item-match"><span class="code-output-item-match-number">' + more.match + '</span><span class="code-output-item-match-percentage-sign">%</span> <span class="code-output-item-match-word" data-i18n="match">' + get_translation('match') + '</span></div>' + filename_html + '<p class="code-output-item-chunk">' + error_message + '</p></div>';
	}
	
	
    
    error_message_el.onclick = (e) => {
		if(target_folder != null && target_filename != null && search_results != null){
			open_file(target_filename,null,target_folder)
			.then((value) => {
				//console.log("opening different file from search result snippet worked. Passing along search_results: ", search_results);
				window.show_rag_search_result(search_results);
			})
			.catch((err) => {
				console.error("error opening different file from search result snippet in document sidebar: ", err);
			})
		}
	
		let line = null;
        let selection_delay = 0;
        if(selection != null && Array.isArray(selection)){
            selection_delay = 500;
            editor.dispatch({
                selection: { head: editor.state.doc.line(selection[0]).from , anchor: editor.state.doc.line(selection[1]).to}, // line.to
                scrollIntoView: true
            });
        }
		
		if(selection != null && !Array.isArray(selection) && typeof selection.from == 'number' && typeof selection.to == 'number'){
            editor.dispatch({
                selection: { head: selection.from, anchor: selection.to},
                scrollIntoView: true
            });
		}
		
		else{
	        const line = editor.state.doc.line(error_line);
	        console.log("add_error_to_output: line: ", line);
	        setTimeout(() => {
	            editor.dispatch({
	                selection: { head: line.from , anchor: line.from}, // line.to
	                scrollIntoView: true // TODO: was disabled. why again?
	            });
	        }, selection_delay);
		}
    }
	//console.log("add_error_to_output: appending: ", error_message_el, codeOutput);
    codeOutput.appendChild(error_message_el);
    
    
    let line_number_els = document.querySelectorAll('.cm-gutterElement');
    for(let x=0; x < line_number_els.length; x++){
		
		const line_text = line_number_els[x].textContent;
		
        if(line_text == '' + error_line){
            line_number_els[x].classList.add('cm-error-line');
        }
        else if(line_text.indexOf(error_line) != -1){
            line_number_els[x].classList.add('cm-contains-error-line');
        }
        else{
            //line_number_els[x].classList.remove('cm-error-line');
        }
    }
}



// draggable alert popup element

dragElement(document.getElementById("display"));

function dragElement(elmnt) {
	if(elmnt == null){
		return
	}
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
      	// if present, the header is where you move the DIV from:
      	document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
      	// otherwise, move the DIV from anywhere inside the DIV:
      	elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}








// CSS EDITING


var createShadowProp = (
	"createShadowRoot" in Element.prototype ? "createShadowRoot" : "webkitCreateShadowRoot"
);

function removeChildren(elt) {
	//console.log('removing children: %s', elt);
	while (elt.firstChild) {
    	elt.removeChild(elt.firstChild);
	}
}
function removeShadowWithCaveat(elementWithShadow) {
    if (!elementWithShadow.parentNode) return elementWithShadow.cloneNode(true);
  
    var ref = elementWithShadow.cloneNode(true);
    while (elementWithShadow.lastChild) ref.appendChild( elementWithShadow.lastChild );
    elementWithShadow.parentNode.replaceChild(elementWithShadow, elementWithShadow);
  
    return ref;
}

function showPlainOldDiv() {
	//console.log('adding a plain old div');
    var host = document.querySelector('#content');
    removeChildren(host);
  
    // Remove the shadow
    host = removeShadowWithCaveat(host);
  
    var template = document.querySelector('#plainDiv');
    host.appendChild(template.content.cloneNode(true));
}

function showShadowTemplate() {
    console.log('adding shadowed template component');
    var host = document.querySelector('#html-output');
    removeChildren(host);

    // Remove the shadow
    host = removeShadowWithCaveat(host);
  
    var template = document.querySelector('#shadowedTemplateComponent');
    var root = host.shadowRoot || host[createShadowProp]({
      "open": true
    });
    root.appendChild(template.content.cloneNode(true));
}






_showDialogButton = document.getElementById('show-dialog-button');
//_statusDialog = codeOutput;
var dialog;
function open_dialog_overlay(dialog_content='') {
	//_statusDialog.textContent = 'Dialog showed...';
	_showDialogButton.disabled = true;
	if (!dialog) {
		var id = 'draggable-dialog';
		// Instanciate the Dialog Box
		dialog = new DialogBox(id, callbackDialog);
		//dialog = new DialogBox(document.getElementById('draggable-dialog'), callbackDialog);
	}
	
	draggable_dialog_content_el.innerHTML = dialog_content;
	
	// Show Dialog Box
	dialog.showDialog();

	// Receive result from Dialog Box
	function callbackDialog(btnName) {
		//console.log("received from dialogbutton:  btnName:", btnName);
		_showDialogButton.disabled = false;
		//_showDialogButton.focus();
		if (btnName == 'close'){
			//_statusDialog.textContent = 'Dialog hidden...';
		}
		else{
			//_statusDialog.textContent = btnName + ' button clicked...';
		}
			
	}
}




function close_overlay(){
	document.body.classList.remove('overlay');
	
}






document.getElementById('editors').onmousedown = () => {
	if(just_started){
		document.body.classList.remove('sidebar');
		just_started = false;
	}
}






/*  TEXT SEARCH  */

function open_text_search(){
	setTimeout(() => {
		
		document.body.classList.add("showing-text-search");
		
		if(document.getElementById('search-both-button') == null){
			let search_pane = document.querySelector('.cm-search.cm-panel');
	
			if(search_pane == null){
				console.warn("ui.js: open_text_search: aborting, could not querySelector element: .cm-search.cm-panel. CodeMirror element was likely not selected at time of CTRL-F ");
				return
			}
			
			let case_checkbox = search_pane.querySelector('input[type=checkbox][name=case]');
			
		
			let search_content_el = document.createElement('div');
			search_content_el.id = 'search-content';
			//search_content_el.classList.add('flex-stack');
		
			let search_input_wrapper = document.createElement('div');
			let search_input1 = document.createElement('input');
			//let search_input2 = document.createElement('input');
			search_input1.classList.add('cm-textfield');
			//search_input2.classList.add('cm-textfield');
			search_input1.type = 'text';
			search_input1.id = 'search-input1';
			//search_input2.id = 'search-input2';
		
			let main_search_input_el = search_pane.querySelector('input[name=search]');
			
			
		
			let search_button = document.createElement('button');
			search_button.classList.add('cm-button');
			search_button.id = 'search-both-button';
			search_button.textContent = 'both';
			search_button.onclick = (event) => {
				let case_sensitive = case_checkbox.checked;
				//console.log("case_sensitive: ", case_sensitive);
				let val1 = main_search_input_el.value;
				let val2 = search_input1.value;
				//console.log("val1, val2:", val1, val2);
				search_both(current_line_nr,val1,val2,case_sensitive);
			}
			
			main_search_input_el.after(search_button);
			main_search_input_el.after(search_input1);
			//search_content_el.appendChild(search_input1);
			//search_content_el.appendChild(search_input2);
			//search_content_el.appendChild(search_button);
		
			//search_pane.prepend(search_content_el);
			
			
			// create list of all search results
			let search_all_button_el = search_pane.querySelector('button[name=select]');
			search_all_button_el.onclick = (event) => {
				//console.log('clicked on search all button');
				let case_sensitive = case_checkbox.checked;
				//console.log("case_sensitive: ", case_sensitive);
				let val1 = main_search_input_el.value;
				let val2 = search_input1.value;
				//console.log("val1, val2:", val1, val2);
				search_both(0,val1,val2,case_sensitive,true); // search both all
			}
		}
		
		
		
	},5);
	
}


function search_both(starting_line=0,val1='',val2='',case_sensitive=false,all=false){
	//console.log("in search_both.  starting_line,val1,val2,case_sensitive,all: ", starting_line,val1,val2,case_sensitive,all);
	let try_looping = false;
	if(starting_line!=0){try_looping=true}
	//console.log("starting search for both at line: ", starting_line);
	//console.log("case_sensitive: ", case_sensitive);
	
	if(all){
		codeOutput.innerHTML = '';
	}
	
	if(val1 == '' && val2 == ''){
		//console.log("search_both: both search strings were empty");
		return
	}
	//console.log("val1, val2:", val1, val2);
	
	let code_lines = code.split(/\r?\n/);
	
	for(let r=starting_line; r < code_lines.length; r++){
		let line = code_lines[r];
		
		if(!case_sensitive){
			line = line.toLowerCase();
			val1 = val1.toLowerCase();
			val2 = val2.toLowerCase();
		}

		if(line.indexOf(val1) != -1 && line.indexOf(val2) != -1){
			if(all){
				add_error_to_output(null,r+1, html_to_string(line),'search');
			}
			else{
				try_looping = false;
				scroll_to_line(r+1);
				break;
			}
		}
	}
	if(try_looping){
		//console.log("looping back to beginning of text");
		search_both();
	}
}



function open_text_search2(){
	open_dialog_overlay();
	
	let search_content_el = document.createElement('div');
	search_content_el.id = 'search-content';
	search_content_el.classList.add('flex-stack');
	
	// SEARCH INPUT
	let search_input_wrapper = document.createElement('div');
	let search_input1 = document.createElement('input');
	let search_input2 = document.createElement('input');
	
	search_input1.type = search_input2.type = 'text';
	search_input1.id = 'search-input1';
	search_input2.id = 'search-input2';
	
	search_input_wrapper.appendChild(search_input1);
	search_input_wrapper.appendChild(search_input2);
	search_content_el.appendChild(search_input_wrapper);
	
	
	
	// REPLACE
	let search_replace_wrapper = document.createElement('div');
	let search_input3 = document.createElement('input');
	search_input3.id = 'search-replace-input';
	search_replace_wrapper.appendChild(search_input3);
	search_content_el.appendChild(search_replace_wrapper);
	
	
	
	// OPTIONS
	let search_options_wrapper = document.createElement('div');
	let search_select = document.createElement('select');
	let search_option1 = document.createElement('input');
	
	search_select.innerHTML = '<option value="file" selected>File</option><option value="dir">Folder</option><option value="subdir1">Folder and 1 sub-folder</option><option value="subdir-all">Folder and all sub-folders</option>';
	search_select.onchange = (event) => {
		//console.log("search select changed.", event, search_select.value);
	}
	
	search_option1.type = 'checkbox';
	search_option1.onchange = (event) => {
		//console.log("checkbox changed", event);
		
		
		
	}
	search_options_wrapper.appendChild(search_select);
	search_options_wrapper.appendChild(search_option1);
	search_content_el.appendChild(search_options_wrapper);
	
	
	
	// OUTPUT
	let search_output_wrapper = document.createElement('div');
	search_output_wrapper.id = 'search-output-container';
	search_content_el.appendChild(search_output_wrapper);
	
	
	
	// BUTTON
	let button_wrapper = document.createElement('div');
	button_wrapper.classList.add('buttonset');
	button_wrapper.classList.add('box-bottom');
	let search_button = document.createElement('button');
	search_button.id = 'search-button';
	search_button.textContent = 'Search';
	let search_all_button = document.createElement('button');
	search_all_button.id = 'search-all-button';
	search_all_button.textContent = 'Search all';
	
	button_wrapper.appendChild(search_button);
	button_wrapper.appendChild(search_all_button);
	search_content_el.appendChild(button_wrapper);
	
	draggable_dialog_content_el.appendChild(search_content_el)
	
}




/*  DISPLAY PROJECTS  */

function display_projects(){
	//console.log("in display_projects.");
	playground_overlay_el.innerHTML = '<h1>PROJECTS</h1>';
	if(keyz(projects).length == 0){
		playground_overlay_el.innerHTML = '<h1>PROJECTS</h1><p>There are no projects</p>';
	}
	
	let add_project_button_el = document.createElement('button');
	add_project_button_el.id = 'add-project-button';
	add_project_button_el.classList.add('new');
	add_project_button_el.classList.add('btn');
	add_project_button_el.textContent = "+ Add project";
	add_project_button_el.onclick = () => {
		
		let new_project_name = prompt('Provide new project name', '');
		if (typeof new_project_name == 'string') {
			if(new_project_name.length){
				update_projects('add',value);
				display_projects();
			}
			else{
				flash_message('Invalid project name', 2000,'fail');
			}
			
		}
		/*
	    vex.dialog.prompt({
	        message: 'Provide new project name',
			//value: '',
	        placeholder: 'Project name',
	        callback: function (value) {
				if(value != ''){
					//console.log("user provided a new project name: ", value);
					update_projects('add',value);
					display_projects();
				}
				else{
					flash_message('Invalid project name', 2000,'fail');
				}
	        }
	    });
		*/
	}
	playground_overlay_el.appendChild(add_project_button_el);
	
	
	let list_content_el = document.createElement('div');
	
	// for(let f = 0; f < json.files.length; f++){
	for (const[project, details] of Object.entries(projects)) {
		//console.log("project: ", project, details);
		
		if(current_project == null){current_project = project} // sets first project as current project
		
		let list_item = document.createElement('div');
		list_item.classList.add('meta-item');
		if(project == current_project){
			list_item.classList.add('selected');
		}
		list_item.innerHTML = '<span class="path">' + project + '</span><span class="file-tabs-list">(' + details.file_tabs.length + ' tabs)</span>';
		list_item.onclick = (event) => {
			//flash_message('clicked on project name: ' + project);
			playground_overlay_el.innerHTML = '';
			current_project = project;
			localStorage.setItem('_playground_current_project',current_project);
			update_ui();
			//display_projects();
		}
		
		let delete_project_button_el = document.createElement('button');
		delete_project_button_el.classList.add('delete');
		delete_project_button_el.classList.add('btn');
		delete_project_button_el.textContent = "🔥 Delete";
		delete_project_button_el.onclick = (event) => {
			event.preventDefault();
			event.stopPropagation();
			delete projects[project];
			localStorage.setItem('_playground_projects', JSON.stringify(projects));
			current_project = null;
			localStorage.setItem('_playground_current_project',current_project);
			update_ui();
			display_projects();
		    flash_message('Deleted project ' + project);
		}
		list_item.appendChild(delete_project_button_el);
		
		list_content_el.appendChild(list_item);
	};
	playground_overlay_el.appendChild(list_content_el);
}






/*  ZIP  */

function display_zip(value){
	//console.log("in display_zip.  value: ", value);
	playground_overlay_el.innerHTML = '<h1 class="playground-overlay-title">📦 ZIP</h1>';
	const zip_buffer = string_to_buffer(value);
	//console.log("zip_buffer: ", typeof zip_buffer, zip_buffer);
	
	document.body.classList.add('zip-file');
	var new_zip = new JSZip();
	
	new_zip.loadAsync(zip_buffer)
	.then(function(zip) {
		//console.log("zip: ", zip);
		
		let zip_content_el = document.createElement('div');
		zip_content_el.id = 'zip-content';
		
		zip.forEach(function (relativePath, zipEntry) { 
			//console.log("zipEntry.name: ", relativePath, zipEntry);
			
			if(!relativePath.startsWith('__MACOSX')){
				let zip_item = document.createElement('div');
				zip_item.classList.add('meta-item');
				zip_item.innerHTML = '<span class="path">' + relativePath + '</span><span class="date">' + dayjs(zipEntry.date).format('YYYY-MM-DD HH:mm:ss') + '</span>';
				zip_content_el.appendChild(zip_item);
			}
			
		});
		playground_overlay_el.appendChild(zip_content_el);
		
		
		let zip_footer_el = document.createElement('div');
		zip_footer_el.classList.add('zip-footer');
		zip_footer_el.classList.add('center');
		
		let download_zip_button_el = document.createElement('button');
		//unzip_button_el.classList.add('btn');
		download_zip_button_el.innerHTML = '<img src="./images/download.svg" class="svg-icon" width="24" height="24" alt="Download" title="Download">';
		download_zip_button_el.onclick = () => {
			console.error("\n\n\ndownload zip button clicked. calling download_currently_open_file");
			download_currently_open_file();
		}
		
		let unzip_button_el = document.createElement('button');
		//unzip_button_el.classList.add('btn');
		unzip_button_el.innerHTML = 'Unzip';
		unzip_button_el.onclick = () => {
			console.error("\n\n\nunzip button clicked");
			unzip(value);
		}
		
		zip_footer_el.appendChild(download_zip_button_el);
		zip_footer_el.appendChild(unzip_button_el);
		playground_overlay_el.appendChild(zip_footer_el);
		
	});
}


function unzip(value=null,type='local',target_folder=null){
	if(target_folder==null){target_folder=folder}
	if(value == null){return}
	//console.log("in unzip.  value,type,target_folder: ", value,type,target_folder);
	//playground_overlay_el.innerHTML = '<h1>ZIP</h1>';
	const zip_buffer = string_to_buffer(value);
	//console.log("zip_buffer: ", typeof zip_buffer, zip_buffer);
	
	var new_zip = new JSZip();
	
	new_zip.loadAsync(zip_buffer)
	.then(function(zip) {
		//console.log("unzip:  zip:", zip);
		
		//let actual_zip_files = [];
		let file_promises = [];
		
		Object.keys(zip.files).forEach(function (filename) {
			
			//console.log("unzip: filename: ", filename);
			
			if(filename.startsWith('__MACOSX')){
				//console.log("unzip: skipping filename that starts with __MACOSX");
				return
			}
			if(filename.startsWith('._')){
				//console.log("unzip: skipping filename that starts with ._");
				return
			}
			
			/*
			let file_type = 'string';
			if(window.filename_is_binary(filename)){
				file_type = 'arraybuffer';
			}
			*/
			let file_type = 'arraybuffer';
			
			// TODO implement promiseAll
			
		    let file_promise = zip.files[filename].async(file_type).then(function (fileData) {
				//console.log("unzip:  got fileData: ", filename, typeof fileData, fileData);
				
				let zip_filename = null;
				let zip_folder = target_folder;
				
				if(filename.indexOf('/') != -1){
					if(filename.endsWith('/')){
						//console.log("zip folder: ", filename);
						zip_folder = zip_folder + '/' + filename;
						//update_sub_folders('add',target_folder);
					}
					else{
						zip_filename = filename.split('/')[filename.split('/').length-1];
						zip_folder = zip_folder + '/' + filename.replace(zip_filename,'');
					}
				}
				else{
					zip_filename = filename;
				}
				
				if(zip_filename != null){
					if(zip_folder.endsWith('/')){
						zip_folder = zip_folder.substr(0,zip_folder.length-1);
					}
					let new_file = new File([fileData], filename);
					
					if(new_file){
						return new_file;
					}
					
				}
				return null
		    })
			
			file_promises.push(file_promise);			
		})
		
		//console.log("unzip: file_promises.length: ", file_promises.length);
		Promise.all(file_promises).then((values) => {
			//console.log("unzip file promises are all done: ", values);
			file_upload(null,values);
		});
		
		
	});
}


//
//  IMAGE EDITOR
//

function create_image_editor(editor_image_el=null){
	//console.log("in create_image_editor.  editor_image_el: ", editor_image_el);
	document.body.classList.add('image-editor');
	
	if(editor_image_el == null){
		editor_image_el = document.getElementById('editor-image');
	}
	
	const { TABS, TOOLS } = FilerobotImageEditor;
	const config = {
  	  source: editor_image_el,
  	  onSave: (editedImageObject, designState) => {
		  // const image = `Img=image/jpeg;base64,T25seUV4YW1wbGU=`
		  console.log('saved', editedImageObject,'\n\n', designState);
		  
		  console.log("editedImageObject.ImageBase64: ", editedImageObject['imageBase64']);
		  
		  const base64 = editedImageObject.imageBase64.split('base64,')[1];
		  //const image_array = base64ToUint8Array(base64);
		  const image_array = '_PLAYGROUND_BINARY_' + buffer_to_string(base64ToArrayBuffer(base64));
		  console.log("editedImageObject.fullName: ", editedImageObject.fullName);

		  save_file(editedImageObject.fullName, image_array,'browser',folder,true); // force save
		  console.log("image_array: ", image_array);
		  
		  // SfxInput-Base
  	  },
  	  annotationsCommon: {
  	    fill: '#ff0000',
  	  },
  	  Text: { text: 'Filerobot...' },
  	  Rotate: { angle: 90, componentType: 'slider' },
  	  translations: {
  	    profile: 'Profile',
  	    coverPhoto: 'Cover photo',
  	    facebook: 'Facebook',
  	    socialMedia: 'Social Media',
  	    fbProfileSize: '180x180px',
  	    fbCoverPhotoSize: '820x312px',
  	  },
  	  Crop: {
  	    presetsItems: [
  	      {
  	        titleKey: 'classicTv',
  	        descriptionKey: '4:3',
  	        ratio: 4 / 3,
  	        // icon: CropClassicTv, // optional, CropClassicTv is a React Function component. Possible (React Function component, string or HTML Element)
  	      },
  	      {
  	        titleKey: 'cinemascope',
  	        descriptionKey: '21:9',
  	        ratio: 21 / 9,
  	        // icon: CropCinemaScope, // optional, CropCinemaScope is a React Function component.  Possible (React Function component, string or HTML Element)
  	      },
  	    ],
  	    presetsFolders: [
  	      {
  	        titleKey: 'socialMedia', // will be translated into Social Media as backend contains this translation key
  	        // icon: Social, // optional, Social is a React Function component. Possible (React Function component, string or HTML Element)
  	        groups: [
  	          {
  	            titleKey: 'facebook',
  	            items: [
  	              {
  	                titleKey: 'profile',
  	                width: 180,
  	                height: 180,
  	                descriptionKey: 'fbProfileSize',
  	              },
  	              {
  	                titleKey: 'coverPhoto',
  	                width: 820,
  	                height: 312,
  	                descriptionKey: 'fbCoverPhotoSize',
  	              },
  	            ],
  	          },
  	        ],
  	      },
  	    ],
  	  },
  	  tabsIds: [TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK], // or ['Adjust', 'Annotate', 'Watermark']
  	  defaultTabId: TABS.ADJUST, // or 'Annotate'
  	  defaultToolId: TOOLS.TEXT, // or 'Text'
	};

	// Assuming we have a div with id="editor_container"
	const filerobotImageEditor = new FilerobotImageEditor(
		document.querySelector('#playground-overlay'),
		config,
	);

	filerobotImageEditor.render({
		onClose: (closingReason) => {
			//console.log('Closing reason', closingReason);
			filerobotImageEditor.terminate();
		},
	});
	
}


// DONWLOAD TEXT FILE

function download(filename, data) {
	//console.log("ui.js: in download.  filename,data: ", filename, data);
	let extension = get_file_extension(filename);
	
	
	if(data.startsWith('_PLAYGROUND_BINARY_')){
		//console.log("generate_image_html: data started with _PLAYGROUND_BINARY_");
		data = data.substr(19);
		//console.log("IMAGE AS TEXT BASE64: ",Base64.encode(data), encodeURIComponent(data) );
		data = string_to_buffer( data );
		
		
		if(filename_is_image(filename)){
			//console.log("download: file seems to be image");
			let is_array_buffer = ArrayBuffer.isView(data);
			//console.log("generate_image_html: raw_data is_array_buffer?: ", is_array_buffer);

			let blob = new Blob([ data ], {type: "image/" + extension});

			//var blob = new Blob([ playground_saved_files[folder + '/' + file] ], {type: 'application/octet-binary'});
			var blob_url = URL.createObjectURL(blob);
			
			var link = document.createElement("a"); // Or maybe get it from the current document
			link.href = blob_url;
			link.download = filename;
			
		    document.body.appendChild(link);
		    link.click();
		    document.body.removeChild(link);
		    window.URL.revokeObjectURL(blob_url);
			
		}
		else{
			// TODO implement more generic download option. WAV, for example
			//console.log("ui.js: DOWNLOAD: still need to implement this file type for downloading"); 
		}
	}
	else{
		//console.log("download: non-binary file");
	    const blob = new Blob([data], {type: 'text/' + extension});
	    if(window.navigator.msSaveOrOpenBlob) {
	        window.navigator.msSaveBlob(blob, filename);
	    }
	    else{
	        const elem = window.document.createElement('a');
	        elem.href = window.URL.createObjectURL(blob);
			if(filename.endsWith('.notes')){
				filename = filename.replace('.notes','.notes.txt');
			}
			if(filename.endsWith('.blueprint')){
				filename = filename.replace('.blueprint','.blueprint.txt');
			}
			
			if(filename.indexOf('.') == -1){
				filename = filename + ".txt";
			}
			
	        elem.download = filename;        
	        document.body.appendChild(elem);
	        elem.click();        
	        document.body.removeChild(elem);
	    }
	}
	

}

function download_currently_open_file(){
	//console.log("in download_currently_open_file");
	//download_file(folder,current_file_name);
	if(typeof current_file_name == 'string' && typeof playground_live_backups[ folder + '/' + current_file_name ] != 'undefined'){
		const data = playground_live_backups[ folder + '/' + current_file_name ];
		download(current_file_name,data);
	}
	else if(typeof current_file_name == 'string' && typeof playground_saved_files[ folder + '/' + current_file_name ] != 'undefined'){
		const data = playground_saved_files[ folder + '/' + current_file_name ];
		download(current_file_name,data);
	}
	else{
		console.error("cannot download currently open file.  current_file_name: ", current_file_name);
	}
}


// It seems there are two download functions now..
function download_file(target_folder,target_filename){
	if(typeof target_folder == 'string' && typeof target_filename == 'string' && typeof playground_live_backups[ target_folder + '/' + target_filename ] == 'string'){
		let data = playground_live_backups[ target_folder + '/' + target_filename ];
		if(data.startsWith('_PLAYGROUND_BINARY_')){
			console.error("download_file: data started with _PLAYGROUND_BINARY_, indicating we're downloading a binary file as a text file")
			data.replace('_PLAYGROUND_BINARY_','');
		}
		download(target_filename,data);
	}
}
