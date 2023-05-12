const ECtxMenuNames = {
  menu: "ctx-menu-wrapper",
  item: "ctx-menu-item",
  separator: "ctx-menu-separator",
  hasIcon: "ctx-menu-hasIcon",
  darkInvert: "ctx-menu-darkInvert",

};

class CtxMenuManagerClass  {
constructor() {
  this._currentMenuVisible = null;
  this._ctxMenus = new Map();
  document.addEventListener("contextmenu", this._eventOpenMenu.bind(this));

  const scripts = document.getElementsByTagName('script');
  const path = scripts[scripts.length - 1].src.split('?')[0];
  const CtxMenuDirectory = path.split('/').slice(0, -1).join('/') + '/';


  var link = document.createElement('link');
  link.href = CtxMenuDirectory + "styles.css";
  link.type = "text/css";
  link.rel = "stylesheet";
  document.getElementsByTagName('head')[0].appendChild(link);

};

_eventOpenMenu(e)  {
  if(e.path != undefined) {
    var menuAndElement = this._traceCtxtMenu(e.path)
  } else {
    var menuAndElement = this._msEdgeTraceCtxMenu(e.target);
  }
  this.closeCurrentlyOpenedMenu();

  if(menuAndElement == null) {
    return null;
  }
const menu = menuAndElement[0];
const elementClicked = menuAndElement[1];

if(menu == false) {
  e.preventDefault();
  return;
}

else if (menu == true) {
  return;
}
menu._elementClicked = elementClicked;
menu.openMenu(e.pageX, e.pageY);
this._currentMenuVisible = menu;

document.addEventListener('click', CtxCloseCurrentlyOpenedMenus);
window.addEventListener('resize', CtxCloseCurrentlyOpenedMenus);
e.preventDefault();
if(menu._openEventListener != undefined) {
    menu._openEventListener();
}



};

closeMenu(menu) {
  menu.closeMenu();
  this._currentMenuVisible = null;
  document.removeEventListener('click', CtxCloseCurrentlyOpenedMenus);
  window.removeEventListener('resize', CtxCloseCurrentlyOpenedMenus);

};
closeCurrentlyOpenedMenu() {
  if(this._currentMenuVisible != null) {
    this.closeMenu(this._currentMenuVisible);
  }
};

_traceCtxtMenu(path) {
  for(var i = 0; i < path.length; ++i) {
    const menu = this._ctxMenusHas(path[i]);
     if(menu != null) {
       return [menu, path[i]];
     }
     }
     return null;
};


_msEdgeTraceCtxMenu(element) {
  while (element != null) {
    const menu = this._ctxMenusHas(element);
    if(menu != null) {
      return [menu, element];
    }
    element = element.parentNode;
  }
  return null;
};

_ctxMenusHas(element) {
  if(this._ctxMenus.has(element)) {
    return this._ctxMenus.get(element);

  }
  if(this._ctxMenus.has("#"+element.id)) {
    return this._ctxMenus.get("#"+element.id)
  }

  if(element.className != undefined) {
    const classNames = element.className.split(" ");
    for(var i = 0; i < classNames.length; i++) {
      if(this._ctxMenus.has("." +classNames[i])) {
        return this._ctxMenus.get("."+classNames[i]);
      }
    }
  }
  if(this._ctxMenus.has(element.nodeName)) {
    return this._ctxMenus.get(element.nodeName);
  }

  return null;

};

getMenuFormElement(element) {
  return this._ctxMenus.get(element);
}

createNewMenu(element) {
var menu = new CtxMenuClass();
this._ctxMenus.set(element, menu);
return menu;

};

setCustomContextMenuValue(element, value) {
  this._ctxMenus.set(element, value);
};


};

class CtxMenuClass  {
constructor() {
  this.menuContainer = document.createElement('div');
  this.menuContainer.className = ECtxMenuNames.menu;
  document.body.appendChild(this.menuContainer);
  this.closeMenu();

  this._elementClicked = undefined;

  this._openEventListener = undefined;
  this._closeEventListener = undefined;
  this._clickEventListener = undefined;

}

addItem(text, customFunction, icon = undefined, index = undefined, bInvertIconDarkMode = false ) {
var element = document.createElement('div');
element.className = ECtxMenuNames.item;

var iconElement = document.createElement('img');
if(icon != undefined && icon != null) {
  iconElement.src = icon;
  var bHasIcon = true;
  console.log(bInvertIconDarkMode);
  if(bInvertIconDarkMode) 
    iconElement.className = ECtxMenuNames.darkInvert;
  } else {
    var bHasIcon = false;
  }
  element.appendChild(iconElement);
  element.innerHTML += text;
  element.addEventListener('click', function() {
    this._callItem(customFunction)
  }.bind(this));

  if(bHasIcon) {
    this.menuContainer.classList.add(ECtxMenuNames.hasIcon);
  }

  this.menuContainer.insertBefore(element, this.menuContainer.childNodes[index]);
  return element;

}

addSeparator(index = undefined) { 
var seperator = document.createElement('div');
seperator.className = ECtxMenuNames.separator;
this.menuContainer.insertBefore(seperator, this.menuContainer.childNodes[index]);
return seperator;

}
getItems() {
  return this.menuContainer.childNodes;
}

getItemAtIndex(index) {
return this.menuContainer.childNodes[index]
}

addEventListener(type, listener) {
  switch(type) {
    case "open":
    this._openEventListener = listener;
    case "close":
    this._closeEventListener = listener;
    case "click":
    this._clickEventListener = listener;
  }
}


openMenu(x, y) {
  this.menuContainer.style.display = "block";
  const PageWidth = (document.documentElement.clientWidth + document.documentElement.scrollLeft);
  const PageHeight = (document.documentElement.clientHeight + document.documentElement.scrollTop);
  if(x + this.menuContainer.offsetWidth > PageWidth) {
    x = PageWidth - this.menuContainer.offsetWidth - 1;
  }
  if(y + this.menuContainer.offsetHeight > PageHeight ) {
    y = PageHeight - this.menuContainer.offsetHeight - 1;
  }

  this.menuContainer.style.left = x + "px";
  this.menuContainer.style.height = y + "px";
}

closeMenu() {
  this.menuContainer.style.left = "0px";
  this.menuContainer.style.top = "0px";
  this.menuContainer.style.display = "none";
  if(this._closeEventListener != undefined) {
    this._closeEventListener();
  }

}

_callItem(customFunction) {
  this.closeMenu();
  setTimeout(function() {
    customFunction(this._elementClicked);
    if(this._clickEventListener != undefined) {
      this._clickEventListener(item);
    } 

  }.bind(this), 1);
}
}


function CtxMenu(element) {
if(element == undefined) {
  element = document;
}

if(ctxMenuManager.getMenuFormElement(element) != undefined) {
  return ctxMenuManager.getMenuFormElement(element);
}
return ctxMenuManager.createNewMenu(element)

}

function CtxMenuBlock(element) {
  ctxMenuManager.setCustomContextMenuValue(element, false)
}

function CtxMenuDefault(element) {
  ctxMenuManager.setCustomContextMenuValue(element, true)
}

function CtxCloseCurrentlyOpenedMenus() {
  ctxMenuManager.closeCurrentlyOpenedMenu();
}

var ctxMenuManager = new CtxMenuManagerClass();

