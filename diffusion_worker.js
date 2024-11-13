//console.log("hello from diffusion_worker.js");

var tvmjsGlobalEnv = tvmjsGlobalEnv || {};
//import "./diffusion/tvmjs_runtime.wasi.js";
let document = {};
let my_task = null;
let cache_name = 'llama-cpp-wasm-cache';


let image_ready = false;
self.interrupted = false;

self.canvas = new OffscreenCanvas(512,512);

function EmccWASI() {
var Module=typeof Module!="undefined"?Module:{};var __wasmLib={};function __wasmLibInstantiateWasm(imports,successCallback){__wasmLib.imports=imports;__wasmLib.successCallback=successCallback}function __wasmLibStart(wasmInstance){__wasmLib.successCallback(wasmInstance)}__wasmLib.start=__wasmLibStart;var Module={"instantiateWasm":__wasmLibInstantiateWasm,"wasmLibraryProvider":__wasmLib};var moduleOverrides=Object.assign({},Module);var arguments_=[];var thisProgram="./this.program";var quit_=(status,toThrow)=>{throw toThrow};var ENVIRONMENT_IS_WEB=typeof window=="object";var ENVIRONMENT_IS_WORKER=typeof importScripts=="function";var ENVIRONMENT_IS_NODE=typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string";var scriptDirectory="";function locateFile(path){if(Module["locateFile"]){return Module["locateFile"](path,scriptDirectory)}return scriptDirectory+path}var read_,readAsync,readBinary,setWindowTitle;function logExceptionOnExit(e){if(e instanceof ExitStatus)return;let toLog=e;if(e&&typeof e=="object"&&e.stack){toLog=[e,e.stack]}err("exiting due to exception: "+toLog)}if(ENVIRONMENT_IS_NODE){var fs=require("fs");var nodePath=require("path");if(ENVIRONMENT_IS_WORKER){scriptDirectory=nodePath.dirname(scriptDirectory)+"/"}else{scriptDirectory=__dirname+"/"}read_=(filename,binary)=>{filename=isFileURI(filename)?new URL(filename):nodePath.normalize(filename);return fs.readFileSync(filename,binary?undefined:"utf8")};readBinary=filename=>{var ret=read_(filename,true);if(!ret.buffer){ret=new Uint8Array(ret)}return ret};readAsync=(filename,onload,onerror)=>{filename=isFileURI(filename)?new URL(filename):nodePath.normalize(filename);fs.readFile(filename,function(err,data){if(err)onerror(err);else onload(data.buffer)})};if(process.argv.length>1){thisProgram=process.argv[1].replace(/\\/g,"/")}arguments_=process.argv.slice(2);if(typeof module!="undefined"){module["exports"]=Module}process.on("uncaughtException",function(ex){if(!(ex instanceof ExitStatus)){throw ex}});var nodeMajor=process.versions.node.split(".")[0];if(nodeMajor<15){process.on("unhandledRejection",function(reason){throw reason})}quit_=(status,toThrow)=>{if(keepRuntimeAlive()){process.exitCode=status;throw toThrow}logExceptionOnExit(toThrow);process.exit(status)};Module["inspect"]=function(){return"[Emscripten Module object]"}}else if(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER){if(ENVIRONMENT_IS_WORKER){scriptDirectory=self.location.href}else if(typeof document!="undefined"&&document.currentScript){scriptDirectory=document.currentScript.src}if(scriptDirectory.indexOf("blob:")!==0){scriptDirectory=scriptDirectory.substr(0,scriptDirectory.replace(/[?#].*/,"").lastIndexOf("/")+1)}else{scriptDirectory=""}{read_=url=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.send(null);return xhr.responseText};if(ENVIRONMENT_IS_WORKER){readBinary=url=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,false);xhr.responseType="arraybuffer";xhr.send(null);return new Uint8Array(xhr.response)}}readAsync=(url,onload,onerror)=>{var xhr=new XMLHttpRequest;xhr.open("GET",url,true);xhr.responseType="arraybuffer";xhr.onload=()=>{if(xhr.status==200||xhr.status==0&&xhr.response){onload(xhr.response);return}onerror()};xhr.onerror=onerror;xhr.send(null)}}setWindowTitle=title=>document.title=title}else{}var out=Module["print"]||console.log.bind(console);var err=Module["printErr"]||console.warn.bind(console);Object.assign(Module,moduleOverrides);moduleOverrides=null;if(Module["arguments"])arguments_=Module["arguments"];if(Module["thisProgram"])thisProgram=Module["thisProgram"];if(Module["quit"])quit_=Module["quit"];var wasmBinary;if(Module["wasmBinary"])wasmBinary=Module["wasmBinary"];var noExitRuntime=Module["noExitRuntime"]||true;if(typeof WebAssembly!="object"){abort("no native wasm support detected")}var wasmMemory;var ABORT=false;var EXITSTATUS;function assert(condition,text){if(!condition){abort(text)}}var UTF8Decoder=typeof TextDecoder!="undefined"?new TextDecoder("utf8"):undefined;function UTF8ArrayToString(heapOrArray,idx,maxBytesToRead){var endIdx=idx+maxBytesToRead;var endPtr=idx;while(heapOrArray[endPtr]&&!(endPtr>=endIdx))++endPtr;if(endPtr-idx>16&&heapOrArray.buffer&&UTF8Decoder){return UTF8Decoder.decode(heapOrArray.subarray(idx,endPtr))}var str="";while(idx<endPtr){var u0=heapOrArray[idx++];if(!(u0&128)){str+=String.fromCharCode(u0);continue}var u1=heapOrArray[idx++]&63;if((u0&224)==192){str+=String.fromCharCode((u0&31)<<6|u1);continue}var u2=heapOrArray[idx++]&63;if((u0&240)==224){u0=(u0&15)<<12|u1<<6|u2}else{u0=(u0&7)<<18|u1<<12|u2<<6|heapOrArray[idx++]&63}if(u0<65536){str+=String.fromCharCode(u0)}else{var ch=u0-65536;str+=String.fromCharCode(55296|ch>>10,56320|ch&1023)}}return str}function UTF8ToString(ptr,maxBytesToRead){return ptr?UTF8ArrayToString(HEAPU8,ptr,maxBytesToRead):""}function stringToUTF8Array(str,heap,outIdx,maxBytesToWrite){if(!(maxBytesToWrite>0))return 0;var startIdx=outIdx;var endIdx=outIdx+maxBytesToWrite-1;for(var i=0;i<str.length;++i){var u=str.charCodeAt(i);if(u>=55296&&u<=57343){var u1=str.charCodeAt(++i);u=65536+((u&1023)<<10)|u1&1023}if(u<=127){if(outIdx>=endIdx)break;heap[outIdx++]=u}else if(u<=2047){if(outIdx+1>=endIdx)break;heap[outIdx++]=192|u>>6;heap[outIdx++]=128|u&63}else if(u<=65535){if(outIdx+2>=endIdx)break;heap[outIdx++]=224|u>>12;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63}else{if(outIdx+3>=endIdx)break;heap[outIdx++]=240|u>>18;heap[outIdx++]=128|u>>12&63;heap[outIdx++]=128|u>>6&63;heap[outIdx++]=128|u&63}}heap[outIdx]=0;return outIdx-startIdx}function lengthBytesUTF8(str){var len=0;for(var i=0;i<str.length;++i){var c=str.charCodeAt(i);if(c<=127){len++}else if(c<=2047){len+=2}else if(c>=55296&&c<=57343){len+=4;++i}else{len+=3}}return len}var HEAP8,HEAPU8,HEAP16,HEAPU16,HEAP32,HEAPU32,HEAPF32,HEAP64,HEAPU64,HEAPF64;function updateMemoryViews(){var b=wasmMemory.buffer;Module["HEAP8"]=HEAP8=new Int8Array(b);Module["HEAP16"]=HEAP16=new Int16Array(b);Module["HEAP32"]=HEAP32=new Int32Array(b);Module["HEAPU8"]=HEAPU8=new Uint8Array(b);Module["HEAPU16"]=HEAPU16=new Uint16Array(b);Module["HEAPU32"]=HEAPU32=new Uint32Array(b);Module["HEAPF32"]=HEAPF32=new Float32Array(b);Module["HEAPF64"]=HEAPF64=new Float64Array(b);Module["HEAP64"]=HEAP64=new BigInt64Array(b);Module["HEAPU64"]=HEAPU64=new BigUint64Array(b)}var wasmTable;var __ATPRERUN__=[];var __ATINIT__=[];var __ATMAIN__=[];var __ATPOSTRUN__=[];var runtimeInitialized=false;function keepRuntimeAlive(){return noExitRuntime}function preRun(){if(Module["preRun"]){if(typeof Module["preRun"]=="function")Module["preRun"]=[Module["preRun"]];while(Module["preRun"].length){addOnPreRun(Module["preRun"].shift())}}callRuntimeCallbacks(__ATPRERUN__)}function initRuntime(){runtimeInitialized=true;if(!Module["noFSInit"]&&!FS.init.initialized)FS.init();FS.ignorePermissions=false;TTY.init();callRuntimeCallbacks(__ATINIT__)}function preMain(){callRuntimeCallbacks(__ATMAIN__)}function postRun(){if(Module["postRun"]){if(typeof Module["postRun"]=="function")Module["postRun"]=[Module["postRun"]];while(Module["postRun"].length){addOnPostRun(Module["postRun"].shift())}}callRuntimeCallbacks(__ATPOSTRUN__)}function addOnPreRun(cb){__ATPRERUN__.unshift(cb)}function addOnPostRun(cb){__ATPOSTRUN__.unshift(cb)}var runDependencies=0;var runDependencyWatcher=null;var dependenciesFulfilled=null;function getUniqueRunDependency(id){return id}function addRunDependency(id){runDependencies++;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}}function removeRunDependency(id){runDependencies--;if(Module["monitorRunDependencies"]){Module["monitorRunDependencies"](runDependencies)}if(runDependencies==0){if(runDependencyWatcher!==null){clearInterval(runDependencyWatcher);runDependencyWatcher=null}if(dependenciesFulfilled){var callback=dependenciesFulfilled;dependenciesFulfilled=null;callback()}}}function abort(what){if(Module["onAbort"]){Module["onAbort"](what)}what="Aborted("+what+")";err(what);ABORT=true;EXITSTATUS=1;what+=". Build with -sASSERTIONS for more info.";var e=new WebAssembly.RuntimeError(what);throw e}var dataURIPrefix="data:application/octet-stream;base64,";function isDataURI(filename){return filename.startsWith(dataURIPrefix)}function isFileURI(filename){return filename.startsWith("file://")}var wasmBinaryFile;wasmBinaryFile="tvmjs_runtime.wasm";if(!isDataURI(wasmBinaryFile)){wasmBinaryFile=locateFile(wasmBinaryFile)}function getBinary(file){try{if(file==wasmBinaryFile&&wasmBinary){return new Uint8Array(wasmBinary)}if(readBinary){return readBinary(file)}throw"both async and sync fetching of the wasm failed"}catch(err){abort(err)}}function getBinaryPromise(binaryFile){if(!wasmBinary&&(ENVIRONMENT_IS_WEB||ENVIRONMENT_IS_WORKER)){if(typeof fetch=="function"&&!isFileURI(binaryFile)){return fetch(binaryFile,{credentials:"same-origin"}).then(function(response){if(!response["ok"]){throw"failed to load wasm binary file at '"+binaryFile+"'"}return response["arrayBuffer"]()}).catch(function(){return getBinary(binaryFile)})}else{if(readAsync){return new Promise(function(resolve,reject){readAsync(binaryFile,function(response){resolve(new Uint8Array(response))},reject)})}}}return Promise.resolve().then(function(){return getBinary(binaryFile)})}function instantiateArrayBuffer(binaryFile,imports,receiver){return getBinaryPromise(binaryFile).then(function(binary){return WebAssembly.instantiate(binary,imports)}).then(function(instance){return instance}).then(receiver,function(reason){err("failed to asynchronously prepare wasm: "+reason);abort(reason)})}function instantiateAsync(binary,binaryFile,imports,callback){if(!binary&&typeof WebAssembly.instantiateStreaming=="function"&&!isDataURI(binaryFile)&&!isFileURI(binaryFile)&&!ENVIRONMENT_IS_NODE&&typeof fetch=="function"){return fetch(binaryFile,{credentials:"same-origin"}).then(function(response){var result=WebAssembly.instantiateStreaming(response,imports);return result.then(callback,function(reason){err("wasm streaming compile failed: "+reason);err("falling back to ArrayBuffer instantiation");return instantiateArrayBuffer(binaryFile,imports,callback)})})}else{return instantiateArrayBuffer(binaryFile,imports,callback)}}function createWasm(){var info={"env":wasmImports,"wasi_snapshot_preview1":wasmImports};function receiveInstance(instance,module){var exports=instance.exports;Module["asm"]=exports;wasmMemory=Module["asm"]["memory"];updateMemoryViews();wasmTable=Module["asm"]["__indirect_function_table"];removeRunDependency("wasm-instantiate");return exports}addRunDependency("wasm-instantiate");function receiveInstantiationResult(result){receiveInstance(result["instance"])}if(Module["instantiateWasm"]){try{return Module["instantiateWasm"](info,receiveInstance)}catch(e){err("Module.instantiateWasm callback failed with error: "+e);return false}}instantiateAsync(wasmBinary,wasmBinaryFile,info,receiveInstantiationResult);return{}}var tempDouble;var tempI64;function ExitStatus(status){this.name="ExitStatus";this.message="Program terminated with exit("+status+")";this.status=status}function callRuntimeCallbacks(callbacks){while(callbacks.length>0){callbacks.shift()(Module)}}function _TVMWasmPackedCFunc(){err("missing function: TVMWasmPackedCFunc");abort(-1)}function _TVMWasmPackedCFuncFinalizer(){err("missing function: TVMWasmPackedCFuncFinalizer");abort(-1)}function __ZN3tvm7runtime9threading10NumThreadsEv(){err("missing function: _ZN3tvm7runtime9threading10NumThreadsEv");abort(-1)}function __ZN3tvm7runtime9threading15ResetThreadPoolEv(){err("missing function: _ZN3tvm7runtime9threading15ResetThreadPoolEv");abort(-1)}var _emscripten_get_now;if(ENVIRONMENT_IS_NODE){_emscripten_get_now=()=>{var t=process.hrtime();return t[0]*1e3+t[1]/1e6}}else _emscripten_get_now=()=>performance.now();var nowIsMonotonic=true;function checkWasiClock(clock_id){return clock_id==0||clock_id==1||clock_id==2||clock_id==3}var PATH={isAbs:path=>path.charAt(0)==="/",splitPath:filename=>{var splitPathRe=/^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;return splitPathRe.exec(filename).slice(1)},normalizeArray:(parts,allowAboveRoot)=>{var up=0;for(var i=parts.length-1;i>=0;i--){var last=parts[i];if(last==="."){parts.splice(i,1)}else if(last===".."){parts.splice(i,1);up++}else if(up){parts.splice(i,1);up--}}if(allowAboveRoot){for(;up;up--){parts.unshift("..")}}return parts},normalize:path=>{var isAbsolute=PATH.isAbs(path),trailingSlash=path.substr(-1)==="/";path=PATH.normalizeArray(path.split("/").filter(p=>!!p),!isAbsolute).join("/");if(!path&&!isAbsolute){path="."}if(path&&trailingSlash){path+="/"}return(isAbsolute?"/":"")+path},dirname:path=>{var result=PATH.splitPath(path),root=result[0],dir=result[1];if(!root&&!dir){return"."}if(dir){dir=dir.substr(0,dir.length-1)}return root+dir},basename:path=>{if(path==="/")return"/";path=PATH.normalize(path);path=path.replace(/\/$/,"");var lastSlash=path.lastIndexOf("/");if(lastSlash===-1)return path;return path.substr(lastSlash+1)},join:function(){var paths=Array.prototype.slice.call(arguments);return PATH.normalize(paths.join("/"))},join2:(l,r)=>{return PATH.normalize(l+"/"+r)}};function getRandomDevice(){if(typeof crypto=="object"&&typeof crypto["getRandomValues"]=="function"){var randomBuffer=new Uint8Array(1);return()=>{crypto.getRandomValues(randomBuffer);return randomBuffer[0]}}else if(ENVIRONMENT_IS_NODE){try{var crypto_module=require("crypto");return()=>crypto_module["randomBytes"](1)[0]}catch(e){}}return()=>abort("randomDevice")}var PATH_FS={resolve:function(){var resolvedPath="",resolvedAbsolute=false;for(var i=arguments.length-1;i>=-1&&!resolvedAbsolute;i--){var path=i>=0?arguments[i]:FS.cwd();if(typeof path!="string"){throw new TypeError("Arguments to path.resolve must be strings")}else if(!path){return""}resolvedPath=path+"/"+resolvedPath;resolvedAbsolute=PATH.isAbs(path)}resolvedPath=PATH.normalizeArray(resolvedPath.split("/").filter(p=>!!p),!resolvedAbsolute).join("/");return(resolvedAbsolute?"/":"")+resolvedPath||"."},relative:(from,to)=>{from=PATH_FS.resolve(from).substr(1);to=PATH_FS.resolve(to).substr(1);function trim(arr){var start=0;for(;start<arr.length;start++){if(arr[start]!=="")break}var end=arr.length-1;for(;end>=0;end--){if(arr[end]!=="")break}if(start>end)return[];return arr.slice(start,end-start+1)}var fromParts=trim(from.split("/"));var toParts=trim(to.split("/"));var length=Math.min(fromParts.length,toParts.length);var samePartsLength=length;for(var i=0;i<length;i++){if(fromParts[i]!==toParts[i]){samePartsLength=i;break}}var outputParts=[];for(var i=samePartsLength;i<fromParts.length;i++){outputParts.push("..")}outputParts=outputParts.concat(toParts.slice(samePartsLength));return outputParts.join("/")}};function intArrayFromString(stringy,dontAddNull,length){var len=length>0?length:lengthBytesUTF8(stringy)+1;var u8array=new Array(len);var numBytesWritten=stringToUTF8Array(stringy,u8array,0,u8array.length);if(dontAddNull)u8array.length=numBytesWritten;return u8array}var TTY={ttys:[],init:function(){},shutdown:function(){},register:function(dev,ops){TTY.ttys[dev]={input:[],output:[],ops:ops};FS.registerDevice(dev,TTY.stream_ops)},stream_ops:{open:function(stream){var tty=TTY.ttys[stream.node.rdev];if(!tty){throw new FS.ErrnoError(43)}stream.tty=tty;stream.seekable=false},close:function(stream){stream.tty.ops.fsync(stream.tty)},fsync:function(stream){stream.tty.ops.fsync(stream.tty)},read:function(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.get_char){throw new FS.ErrnoError(60)}var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=stream.tty.ops.get_char(stream.tty)}catch(e){throw new FS.ErrnoError(29)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(6)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result}if(bytesRead){stream.node.timestamp=Date.now()}return bytesRead},write:function(stream,buffer,offset,length,pos){if(!stream.tty||!stream.tty.ops.put_char){throw new FS.ErrnoError(60)}try{for(var i=0;i<length;i++){stream.tty.ops.put_char(stream.tty,buffer[offset+i])}}catch(e){throw new FS.ErrnoError(29)}if(length){stream.node.timestamp=Date.now()}return i}},default_tty_ops:{get_char:function(tty){if(!tty.input.length){var result=null;if(ENVIRONMENT_IS_NODE){var BUFSIZE=256;var buf=Buffer.alloc(BUFSIZE);var bytesRead=0;try{bytesRead=fs.readSync(process.stdin.fd,buf,0,BUFSIZE,-1)}catch(e){if(e.toString().includes("EOF"))bytesRead=0;else throw e}if(bytesRead>0){result=buf.slice(0,bytesRead).toString("utf-8")}else{result=null}}else if(typeof window!="undefined"&&typeof window.prompt=="function"){result=window.prompt("Input: ");if(result!==null){result+="\n"}}else if(typeof readline=="function"){result=readline();if(result!==null){result+="\n"}}if(!result){return null}tty.input=intArrayFromString(result,true)}return tty.input.shift()},put_char:function(tty,val){if(val===null||val===10){out(UTF8ArrayToString(tty.output,0));tty.output=[]}else{if(val!=0)tty.output.push(val)}},fsync:function(tty){if(tty.output&&tty.output.length>0){out(UTF8ArrayToString(tty.output,0));tty.output=[]}}},default_tty1_ops:{put_char:function(tty,val){if(val===null||val===10){err(UTF8ArrayToString(tty.output,0));tty.output=[]}else{if(val!=0)tty.output.push(val)}},fsync:function(tty){if(tty.output&&tty.output.length>0){err(UTF8ArrayToString(tty.output,0));tty.output=[]}}}};function mmapAlloc(size){abort()}var MEMFS={ops_table:null,mount:function(mount){return MEMFS.createNode(null,"/",16384|511,0)},createNode:function(parent,name,mode,dev){if(FS.isBlkdev(mode)||FS.isFIFO(mode)){throw new FS.ErrnoError(63)}if(!MEMFS.ops_table){MEMFS.ops_table={dir:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,lookup:MEMFS.node_ops.lookup,mknod:MEMFS.node_ops.mknod,rename:MEMFS.node_ops.rename,unlink:MEMFS.node_ops.unlink,rmdir:MEMFS.node_ops.rmdir,readdir:MEMFS.node_ops.readdir,symlink:MEMFS.node_ops.symlink},stream:{llseek:MEMFS.stream_ops.llseek}},file:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:{llseek:MEMFS.stream_ops.llseek,read:MEMFS.stream_ops.read,write:MEMFS.stream_ops.write,allocate:MEMFS.stream_ops.allocate,mmap:MEMFS.stream_ops.mmap,msync:MEMFS.stream_ops.msync}},link:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr,readlink:MEMFS.node_ops.readlink},stream:{}},chrdev:{node:{getattr:MEMFS.node_ops.getattr,setattr:MEMFS.node_ops.setattr},stream:FS.chrdev_stream_ops}}}var node=FS.createNode(parent,name,mode,dev);if(FS.isDir(node.mode)){node.node_ops=MEMFS.ops_table.dir.node;node.stream_ops=MEMFS.ops_table.dir.stream;node.contents={}}else if(FS.isFile(node.mode)){node.node_ops=MEMFS.ops_table.file.node;node.stream_ops=MEMFS.ops_table.file.stream;node.usedBytes=0;node.contents=null}else if(FS.isLink(node.mode)){node.node_ops=MEMFS.ops_table.link.node;node.stream_ops=MEMFS.ops_table.link.stream}else if(FS.isChrdev(node.mode)){node.node_ops=MEMFS.ops_table.chrdev.node;node.stream_ops=MEMFS.ops_table.chrdev.stream}node.timestamp=Date.now();if(parent){parent.contents[name]=node;parent.timestamp=node.timestamp}return node},getFileDataAsTypedArray:function(node){if(!node.contents)return new Uint8Array(0);if(node.contents.subarray)return node.contents.subarray(0,node.usedBytes);return new Uint8Array(node.contents)},expandFileStorage:function(node,newCapacity){var prevCapacity=node.contents?node.contents.length:0;if(prevCapacity>=newCapacity)return;var CAPACITY_DOUBLING_MAX=1024*1024;newCapacity=Math.max(newCapacity,prevCapacity*(prevCapacity<CAPACITY_DOUBLING_MAX?2:1.125)>>>0);if(prevCapacity!=0)newCapacity=Math.max(newCapacity,256);var oldContents=node.contents;node.contents=new Uint8Array(newCapacity);if(node.usedBytes>0)node.contents.set(oldContents.subarray(0,node.usedBytes),0)},resizeFileStorage:function(node,newSize){if(node.usedBytes==newSize)return;if(newSize==0){node.contents=null;node.usedBytes=0}else{var oldContents=node.contents;node.contents=new Uint8Array(newSize);if(oldContents){node.contents.set(oldContents.subarray(0,Math.min(newSize,node.usedBytes)))}node.usedBytes=newSize}},node_ops:{getattr:function(node){var attr={};attr.dev=FS.isChrdev(node.mode)?node.id:1;attr.ino=node.id;attr.mode=node.mode;attr.nlink=1;attr.uid=0;attr.gid=0;attr.rdev=node.rdev;if(FS.isDir(node.mode)){attr.size=4096}else if(FS.isFile(node.mode)){attr.size=node.usedBytes}else if(FS.isLink(node.mode)){attr.size=node.link.length}else{attr.size=0}attr.atime=new Date(node.timestamp);attr.mtime=new Date(node.timestamp);attr.ctime=new Date(node.timestamp);attr.blksize=4096;attr.blocks=Math.ceil(attr.size/attr.blksize);return attr},setattr:function(node,attr){if(attr.mode!==undefined){node.mode=attr.mode}if(attr.timestamp!==undefined){node.timestamp=attr.timestamp}if(attr.size!==undefined){MEMFS.resizeFileStorage(node,attr.size)}},lookup:function(parent,name){throw FS.genericErrors[44]},mknod:function(parent,name,mode,dev){return MEMFS.createNode(parent,name,mode,dev)},rename:function(old_node,new_dir,new_name){if(FS.isDir(old_node.mode)){var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(new_node){for(var i in new_node.contents){throw new FS.ErrnoError(55)}}}delete old_node.parent.contents[old_node.name];old_node.parent.timestamp=Date.now();old_node.name=new_name;new_dir.contents[new_name]=old_node;new_dir.timestamp=old_node.parent.timestamp;old_node.parent=new_dir},unlink:function(parent,name){delete parent.contents[name];parent.timestamp=Date.now()},rmdir:function(parent,name){var node=FS.lookupNode(parent,name);for(var i in node.contents){throw new FS.ErrnoError(55)}delete parent.contents[name];parent.timestamp=Date.now()},readdir:function(node){var entries=[".",".."];for(var key in node.contents){if(!node.contents.hasOwnProperty(key)){continue}entries.push(key)}return entries},symlink:function(parent,newname,oldpath){var node=MEMFS.createNode(parent,newname,511|40960,0);node.link=oldpath;return node},readlink:function(node){if(!FS.isLink(node.mode)){throw new FS.ErrnoError(28)}return node.link}},stream_ops:{read:function(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=stream.node.usedBytes)return 0;var size=Math.min(stream.node.usedBytes-position,length);if(size>8&&contents.subarray){buffer.set(contents.subarray(position,position+size),offset)}else{for(var i=0;i<size;i++)buffer[offset+i]=contents[position+i]}return size},write:function(stream,buffer,offset,length,position,canOwn){if(buffer.buffer===HEAP8.buffer){canOwn=false}if(!length)return 0;var node=stream.node;node.timestamp=Date.now();if(buffer.subarray&&(!node.contents||node.contents.subarray)){if(canOwn){node.contents=buffer.subarray(offset,offset+length);node.usedBytes=length;return length}else if(node.usedBytes===0&&position===0){node.contents=buffer.slice(offset,offset+length);node.usedBytes=length;return length}else if(position+length<=node.usedBytes){node.contents.set(buffer.subarray(offset,offset+length),position);return length}}MEMFS.expandFileStorage(node,position+length);if(node.contents.subarray&&buffer.subarray){node.contents.set(buffer.subarray(offset,offset+length),position)}else{for(var i=0;i<length;i++){node.contents[position+i]=buffer[offset+i]}}node.usedBytes=Math.max(node.usedBytes,position+length);return length},llseek:function(stream,offset,whence){var position=offset;if(whence===1){position+=stream.position}else if(whence===2){if(FS.isFile(stream.node.mode)){position+=stream.node.usedBytes}}if(position<0){throw new FS.ErrnoError(28)}return position},allocate:function(stream,offset,length){MEMFS.expandFileStorage(stream.node,offset+length);stream.node.usedBytes=Math.max(stream.node.usedBytes,offset+length)},mmap:function(stream,length,position,prot,flags){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43)}var ptr;var allocated;var contents=stream.node.contents;if(!(flags&2)&&contents.buffer===HEAP8.buffer){allocated=false;ptr=contents.byteOffset}else{if(position>0||position+length<contents.length){if(contents.subarray){contents=contents.subarray(position,position+length)}else{contents=Array.prototype.slice.call(contents,position,position+length)}}allocated=true;ptr=mmapAlloc(length);if(!ptr){throw new FS.ErrnoError(48)}HEAP8.set(contents,ptr)}return{ptr:ptr,allocated:allocated}},msync:function(stream,buffer,offset,length,mmapFlags){MEMFS.stream_ops.write(stream,buffer,0,length,offset,false);return 0}}};function asyncLoad(url,onload,onerror,noRunDep){var dep=!noRunDep?getUniqueRunDependency("al "+url):"";readAsync(url,arrayBuffer=>{assert(arrayBuffer,'Loading data file "'+url+'" failed (no arrayBuffer).');onload(new Uint8Array(arrayBuffer));if(dep)removeRunDependency(dep)},event=>{if(onerror){onerror()}else{throw'Loading data file "'+url+'" failed.'}});if(dep)addRunDependency(dep)}var FS={root:null,mounts:[],devices:{},streams:[],nextInode:1,nameTable:null,currentPath:"/",initialized:false,ignorePermissions:true,ErrnoError:null,genericErrors:{},filesystems:null,syncFSRequests:0,lookupPath:(path,opts={})=>{path=PATH_FS.resolve(path);if(!path)return{path:"",node:null};var defaults={follow_mount:true,recurse_count:0};opts=Object.assign(defaults,opts);if(opts.recurse_count>8){throw new FS.ErrnoError(32)}var parts=path.split("/").filter(p=>!!p);var current=FS.root;var current_path="/";for(var i=0;i<parts.length;i++){var islast=i===parts.length-1;if(islast&&opts.parent){break}current=FS.lookupNode(current,parts[i]);current_path=PATH.join2(current_path,parts[i]);if(FS.isMountpoint(current)){if(!islast||islast&&opts.follow_mount){current=current.mounted.root}}if(!islast||opts.follow){var count=0;while(FS.isLink(current.mode)){var link=FS.readlink(current_path);current_path=PATH_FS.resolve(PATH.dirname(current_path),link);var lookup=FS.lookupPath(current_path,{recurse_count:opts.recurse_count+1});current=lookup.node;if(count++>40){throw new FS.ErrnoError(32)}}}}return{path:current_path,node:current}},getPath:node=>{var path;while(true){if(FS.isRoot(node)){var mount=node.mount.mountpoint;if(!path)return mount;return mount[mount.length-1]!=="/"?mount+"/"+path:mount+path}path=path?node.name+"/"+path:node.name;node=node.parent}},hashName:(parentid,name)=>{var hash=0;for(var i=0;i<name.length;i++){hash=(hash<<5)-hash+name.charCodeAt(i)|0}return(parentid+hash>>>0)%FS.nameTable.length},hashAddNode:node=>{var hash=FS.hashName(node.parent.id,node.name);node.name_next=FS.nameTable[hash];FS.nameTable[hash]=node},hashRemoveNode:node=>{var hash=FS.hashName(node.parent.id,node.name);if(FS.nameTable[hash]===node){FS.nameTable[hash]=node.name_next}else{var current=FS.nameTable[hash];while(current){if(current.name_next===node){current.name_next=node.name_next;break}current=current.name_next}}},lookupNode:(parent,name)=>{var errCode=FS.mayLookup(parent);if(errCode){throw new FS.ErrnoError(errCode,parent)}var hash=FS.hashName(parent.id,name);for(var node=FS.nameTable[hash];node;node=node.name_next){var nodeName=node.name;if(node.parent.id===parent.id&&nodeName===name){return node}}return FS.lookup(parent,name)},createNode:(parent,name,mode,rdev)=>{var node=new FS.FSNode(parent,name,mode,rdev);FS.hashAddNode(node);return node},destroyNode:node=>{FS.hashRemoveNode(node)},isRoot:node=>{return node===node.parent},isMountpoint:node=>{return!!node.mounted},isFile:mode=>{return(mode&61440)===32768},isDir:mode=>{return(mode&61440)===16384},isLink:mode=>{return(mode&61440)===40960},isChrdev:mode=>{return(mode&61440)===8192},isBlkdev:mode=>{return(mode&61440)===24576},isFIFO:mode=>{return(mode&61440)===4096},isSocket:mode=>{return(mode&49152)===49152},flagModes:{"r":0,"r+":2,"w":577,"w+":578,"a":1089,"a+":1090},modeStringToFlags:str=>{var flags=FS.flagModes[str];if(typeof flags=="undefined"){throw new Error("Unknown file open mode: "+str)}return flags},flagsToPermissionString:flag=>{var perms=["r","w","rw"][flag&3];if(flag&512){perms+="w"}return perms},nodePermissions:(node,perms)=>{if(FS.ignorePermissions){return 0}if(perms.includes("r")&&!(node.mode&292)){return 2}else if(perms.includes("w")&&!(node.mode&146)){return 2}else if(perms.includes("x")&&!(node.mode&73)){return 2}return 0},mayLookup:dir=>{var errCode=FS.nodePermissions(dir,"x");if(errCode)return errCode;if(!dir.node_ops.lookup)return 2;return 0},mayCreate:(dir,name)=>{try{var node=FS.lookupNode(dir,name);return 20}catch(e){}return FS.nodePermissions(dir,"wx")},mayDelete:(dir,name,isdir)=>{var node;try{node=FS.lookupNode(dir,name)}catch(e){return e.errno}var errCode=FS.nodePermissions(dir,"wx");if(errCode){return errCode}if(isdir){if(!FS.isDir(node.mode)){return 54}if(FS.isRoot(node)||FS.getPath(node)===FS.cwd()){return 10}}else{if(FS.isDir(node.mode)){return 31}}return 0},mayOpen:(node,flags)=>{if(!node){return 44}if(FS.isLink(node.mode)){return 32}else if(FS.isDir(node.mode)){if(FS.flagsToPermissionString(flags)!=="r"||flags&512){return 31}}return FS.nodePermissions(node,FS.flagsToPermissionString(flags))},MAX_OPEN_FDS:4096,nextfd:(fd_start=0,fd_end=FS.MAX_OPEN_FDS)=>{for(var fd=fd_start;fd<=fd_end;fd++){if(!FS.streams[fd]){return fd}}throw new FS.ErrnoError(33)},getStream:fd=>FS.streams[fd],createStream:(stream,fd_start,fd_end)=>{if(!FS.FSStream){FS.FSStream=function(){this.shared={}};FS.FSStream.prototype={};Object.defineProperties(FS.FSStream.prototype,{object:{get:function(){return this.node},set:function(val){this.node=val}},isRead:{get:function(){return(this.flags&2097155)!==1}},isWrite:{get:function(){return(this.flags&2097155)!==0}},isAppend:{get:function(){return this.flags&1024}},flags:{get:function(){return this.shared.flags},set:function(val){this.shared.flags=val}},position:{get:function(){return this.shared.position},set:function(val){this.shared.position=val}}})}stream=Object.assign(new FS.FSStream,stream);var fd=FS.nextfd(fd_start,fd_end);stream.fd=fd;FS.streams[fd]=stream;return stream},closeStream:fd=>{FS.streams[fd]=null},chrdev_stream_ops:{open:stream=>{var device=FS.getDevice(stream.node.rdev);stream.stream_ops=device.stream_ops;if(stream.stream_ops.open){stream.stream_ops.open(stream)}},llseek:()=>{throw new FS.ErrnoError(70)}},major:dev=>dev>>8,minor:dev=>dev&255,makedev:(ma,mi)=>ma<<8|mi,registerDevice:(dev,ops)=>{FS.devices[dev]={stream_ops:ops}},getDevice:dev=>FS.devices[dev],getMounts:mount=>{var mounts=[];var check=[mount];while(check.length){var m=check.pop();mounts.push(m);check.push.apply(check,m.mounts)}return mounts},syncfs:(populate,callback)=>{if(typeof populate=="function"){callback=populate;populate=false}FS.syncFSRequests++;if(FS.syncFSRequests>1){err("warning: "+FS.syncFSRequests+" FS.syncfs operations in flight at once, probably just doing extra work")}var mounts=FS.getMounts(FS.root.mount);var completed=0;function doCallback(errCode){FS.syncFSRequests--;return callback(errCode)}function done(errCode){if(errCode){if(!done.errored){done.errored=true;return doCallback(errCode)}return}if(++completed>=mounts.length){doCallback(null)}}mounts.forEach(mount=>{if(!mount.type.syncfs){return done(null)}mount.type.syncfs(mount,populate,done)})},mount:(type,opts,mountpoint)=>{var root=mountpoint==="/";var pseudo=!mountpoint;var node;if(root&&FS.root){throw new FS.ErrnoError(10)}else if(!root&&!pseudo){var lookup=FS.lookupPath(mountpoint,{follow_mount:false});mountpoint=lookup.path;node=lookup.node;if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}if(!FS.isDir(node.mode)){throw new FS.ErrnoError(54)}}var mount={type:type,opts:opts,mountpoint:mountpoint,mounts:[]};var mountRoot=type.mount(mount);mountRoot.mount=mount;mount.root=mountRoot;if(root){FS.root=mountRoot}else if(node){node.mounted=mount;if(node.mount){node.mount.mounts.push(mount)}}return mountRoot},unmount:mountpoint=>{var lookup=FS.lookupPath(mountpoint,{follow_mount:false});if(!FS.isMountpoint(lookup.node)){throw new FS.ErrnoError(28)}var node=lookup.node;var mount=node.mounted;var mounts=FS.getMounts(mount);Object.keys(FS.nameTable).forEach(hash=>{var current=FS.nameTable[hash];while(current){var next=current.name_next;if(mounts.includes(current.mount)){FS.destroyNode(current)}current=next}});node.mounted=null;var idx=node.mount.mounts.indexOf(mount);node.mount.mounts.splice(idx,1)},lookup:(parent,name)=>{return parent.node_ops.lookup(parent,name)},mknod:(path,mode,dev)=>{var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);if(!name||name==="."||name===".."){throw new FS.ErrnoError(28)}var errCode=FS.mayCreate(parent,name);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.mknod){throw new FS.ErrnoError(63)}return parent.node_ops.mknod(parent,name,mode,dev)},create:(path,mode)=>{mode=mode!==undefined?mode:438;mode&=4095;mode|=32768;return FS.mknod(path,mode,0)},mkdir:(path,mode)=>{mode=mode!==undefined?mode:511;mode&=511|512;mode|=16384;return FS.mknod(path,mode,0)},mkdirTree:(path,mode)=>{var dirs=path.split("/");var d="";for(var i=0;i<dirs.length;++i){if(!dirs[i])continue;d+="/"+dirs[i];try{FS.mkdir(d,mode)}catch(e){if(e.errno!=20)throw e}}},mkdev:(path,mode,dev)=>{if(typeof dev=="undefined"){dev=mode;mode=438}mode|=8192;return FS.mknod(path,mode,dev)},symlink:(oldpath,newpath)=>{if(!PATH_FS.resolve(oldpath)){throw new FS.ErrnoError(44)}var lookup=FS.lookupPath(newpath,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(44)}var newname=PATH.basename(newpath);var errCode=FS.mayCreate(parent,newname);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.symlink){throw new FS.ErrnoError(63)}return parent.node_ops.symlink(parent,newname,oldpath)},rename:(old_path,new_path)=>{var old_dirname=PATH.dirname(old_path);var new_dirname=PATH.dirname(new_path);var old_name=PATH.basename(old_path);var new_name=PATH.basename(new_path);var lookup,old_dir,new_dir;lookup=FS.lookupPath(old_path,{parent:true});old_dir=lookup.node;lookup=FS.lookupPath(new_path,{parent:true});new_dir=lookup.node;if(!old_dir||!new_dir)throw new FS.ErrnoError(44);if(old_dir.mount!==new_dir.mount){throw new FS.ErrnoError(75)}var old_node=FS.lookupNode(old_dir,old_name);var relative=PATH_FS.relative(old_path,new_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(28)}relative=PATH_FS.relative(new_path,old_dirname);if(relative.charAt(0)!=="."){throw new FS.ErrnoError(55)}var new_node;try{new_node=FS.lookupNode(new_dir,new_name)}catch(e){}if(old_node===new_node){return}var isdir=FS.isDir(old_node.mode);var errCode=FS.mayDelete(old_dir,old_name,isdir);if(errCode){throw new FS.ErrnoError(errCode)}errCode=new_node?FS.mayDelete(new_dir,new_name,isdir):FS.mayCreate(new_dir,new_name);if(errCode){throw new FS.ErrnoError(errCode)}if(!old_dir.node_ops.rename){throw new FS.ErrnoError(63)}if(FS.isMountpoint(old_node)||new_node&&FS.isMountpoint(new_node)){throw new FS.ErrnoError(10)}if(new_dir!==old_dir){errCode=FS.nodePermissions(old_dir,"w");if(errCode){throw new FS.ErrnoError(errCode)}}FS.hashRemoveNode(old_node);try{old_dir.node_ops.rename(old_node,new_dir,new_name)}catch(e){throw e}finally{FS.hashAddNode(old_node)}},rmdir:path=>{var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var errCode=FS.mayDelete(parent,name,true);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.rmdir){throw new FS.ErrnoError(63)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}parent.node_ops.rmdir(parent,name);FS.destroyNode(node)},readdir:path=>{var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;if(!node.node_ops.readdir){throw new FS.ErrnoError(54)}return node.node_ops.readdir(node)},unlink:path=>{var lookup=FS.lookupPath(path,{parent:true});var parent=lookup.node;if(!parent){throw new FS.ErrnoError(44)}var name=PATH.basename(path);var node=FS.lookupNode(parent,name);var errCode=FS.mayDelete(parent,name,false);if(errCode){throw new FS.ErrnoError(errCode)}if(!parent.node_ops.unlink){throw new FS.ErrnoError(63)}if(FS.isMountpoint(node)){throw new FS.ErrnoError(10)}parent.node_ops.unlink(parent,name);FS.destroyNode(node)},readlink:path=>{var lookup=FS.lookupPath(path);var link=lookup.node;if(!link){throw new FS.ErrnoError(44)}if(!link.node_ops.readlink){throw new FS.ErrnoError(28)}return PATH_FS.resolve(FS.getPath(link.parent),link.node_ops.readlink(link))},stat:(path,dontFollow)=>{var lookup=FS.lookupPath(path,{follow:!dontFollow});var node=lookup.node;if(!node){throw new FS.ErrnoError(44)}if(!node.node_ops.getattr){throw new FS.ErrnoError(63)}return node.node_ops.getattr(node)},lstat:path=>{return FS.stat(path,true)},chmod:(path,mode,dontFollow)=>{var node;if(typeof path=="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}if(!node.node_ops.setattr){throw new FS.ErrnoError(63)}node.node_ops.setattr(node,{mode:mode&4095|node.mode&~4095,timestamp:Date.now()})},lchmod:(path,mode)=>{FS.chmod(path,mode,true)},fchmod:(fd,mode)=>{var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(8)}FS.chmod(stream.node,mode)},chown:(path,uid,gid,dontFollow)=>{var node;if(typeof path=="string"){var lookup=FS.lookupPath(path,{follow:!dontFollow});node=lookup.node}else{node=path}if(!node.node_ops.setattr){throw new FS.ErrnoError(63)}node.node_ops.setattr(node,{timestamp:Date.now()})},lchown:(path,uid,gid)=>{FS.chown(path,uid,gid,true)},fchown:(fd,uid,gid)=>{var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(8)}FS.chown(stream.node,uid,gid)},truncate:(path,len)=>{if(len<0){throw new FS.ErrnoError(28)}var node;if(typeof path=="string"){var lookup=FS.lookupPath(path,{follow:true});node=lookup.node}else{node=path}if(!node.node_ops.setattr){throw new FS.ErrnoError(63)}if(FS.isDir(node.mode)){throw new FS.ErrnoError(31)}if(!FS.isFile(node.mode)){throw new FS.ErrnoError(28)}var errCode=FS.nodePermissions(node,"w");if(errCode){throw new FS.ErrnoError(errCode)}node.node_ops.setattr(node,{size:len,timestamp:Date.now()})},ftruncate:(fd,len)=>{var stream=FS.getStream(fd);if(!stream){throw new FS.ErrnoError(8)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(28)}FS.truncate(stream.node,len)},utime:(path,atime,mtime)=>{var lookup=FS.lookupPath(path,{follow:true});var node=lookup.node;node.node_ops.setattr(node,{timestamp:Math.max(atime,mtime)})},open:(path,flags,mode)=>{if(path===""){throw new FS.ErrnoError(44)}flags=typeof flags=="string"?FS.modeStringToFlags(flags):flags;mode=typeof mode=="undefined"?438:mode;if(flags&64){mode=mode&4095|32768}else{mode=0}var node;if(typeof path=="object"){node=path}else{path=PATH.normalize(path);try{var lookup=FS.lookupPath(path,{follow:!(flags&131072)});node=lookup.node}catch(e){}}var created=false;if(flags&64){if(node){if(flags&128){throw new FS.ErrnoError(20)}}else{node=FS.mknod(path,mode,0);created=true}}if(!node){throw new FS.ErrnoError(44)}if(FS.isChrdev(node.mode)){flags&=~512}if(flags&65536&&!FS.isDir(node.mode)){throw new FS.ErrnoError(54)}if(!created){var errCode=FS.mayOpen(node,flags);if(errCode){throw new FS.ErrnoError(errCode)}}if(flags&512&&!created){FS.truncate(node,0)}flags&=~(128|512|131072);var stream=FS.createStream({node:node,path:FS.getPath(node),flags:flags,seekable:true,position:0,stream_ops:node.stream_ops,ungotten:[],error:false});if(stream.stream_ops.open){stream.stream_ops.open(stream)}if(Module["logReadFiles"]&&!(flags&1)){if(!FS.readFiles)FS.readFiles={};if(!(path in FS.readFiles)){FS.readFiles[path]=1}}return stream},close:stream=>{if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if(stream.getdents)stream.getdents=null;try{if(stream.stream_ops.close){stream.stream_ops.close(stream)}}catch(e){throw e}finally{FS.closeStream(stream.fd)}stream.fd=null},isClosed:stream=>{return stream.fd===null},llseek:(stream,offset,whence)=>{if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if(!stream.seekable||!stream.stream_ops.llseek){throw new FS.ErrnoError(70)}if(whence!=0&&whence!=1&&whence!=2){throw new FS.ErrnoError(28)}stream.position=stream.stream_ops.llseek(stream,offset,whence);stream.ungotten=[];return stream.position},read:(stream,buffer,offset,length,position)=>{if(length<0||position<0){throw new FS.ErrnoError(28)}if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(8)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(31)}if(!stream.stream_ops.read){throw new FS.ErrnoError(28)}var seeking=typeof position!="undefined";if(!seeking){position=stream.position}else if(!stream.seekable){throw new FS.ErrnoError(70)}var bytesRead=stream.stream_ops.read(stream,buffer,offset,length,position);if(!seeking)stream.position+=bytesRead;return bytesRead},write:(stream,buffer,offset,length,position,canOwn)=>{if(length<0||position<0){throw new FS.ErrnoError(28)}if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(8)}if(FS.isDir(stream.node.mode)){throw new FS.ErrnoError(31)}if(!stream.stream_ops.write){throw new FS.ErrnoError(28)}if(stream.seekable&&stream.flags&1024){FS.llseek(stream,0,2)}var seeking=typeof position!="undefined";if(!seeking){position=stream.position}else if(!stream.seekable){throw new FS.ErrnoError(70)}var bytesWritten=stream.stream_ops.write(stream,buffer,offset,length,position,canOwn);if(!seeking)stream.position+=bytesWritten;return bytesWritten},allocate:(stream,offset,length)=>{if(FS.isClosed(stream)){throw new FS.ErrnoError(8)}if(offset<0||length<=0){throw new FS.ErrnoError(28)}if((stream.flags&2097155)===0){throw new FS.ErrnoError(8)}if(!FS.isFile(stream.node.mode)&&!FS.isDir(stream.node.mode)){throw new FS.ErrnoError(43)}if(!stream.stream_ops.allocate){throw new FS.ErrnoError(138)}stream.stream_ops.allocate(stream,offset,length)},mmap:(stream,length,position,prot,flags)=>{if((prot&2)!==0&&(flags&2)===0&&(stream.flags&2097155)!==2){throw new FS.ErrnoError(2)}if((stream.flags&2097155)===1){throw new FS.ErrnoError(2)}if(!stream.stream_ops.mmap){throw new FS.ErrnoError(43)}return stream.stream_ops.mmap(stream,length,position,prot,flags)},msync:(stream,buffer,offset,length,mmapFlags)=>{if(!stream.stream_ops.msync){return 0}return stream.stream_ops.msync(stream,buffer,offset,length,mmapFlags)},munmap:stream=>0,ioctl:(stream,cmd,arg)=>{if(!stream.stream_ops.ioctl){throw new FS.ErrnoError(59)}return stream.stream_ops.ioctl(stream,cmd,arg)},readFile:(path,opts={})=>{opts.flags=opts.flags||0;opts.encoding=opts.encoding||"binary";if(opts.encoding!=="utf8"&&opts.encoding!=="binary"){throw new Error('Invalid encoding type "'+opts.encoding+'"')}var ret;var stream=FS.open(path,opts.flags);var stat=FS.stat(path);var length=stat.size;var buf=new Uint8Array(length);FS.read(stream,buf,0,length,0);if(opts.encoding==="utf8"){ret=UTF8ArrayToString(buf,0)}else if(opts.encoding==="binary"){ret=buf}FS.close(stream);return ret},writeFile:(path,data,opts={})=>{opts.flags=opts.flags||577;var stream=FS.open(path,opts.flags,opts.mode);if(typeof data=="string"){var buf=new Uint8Array(lengthBytesUTF8(data)+1);var actualNumBytes=stringToUTF8Array(data,buf,0,buf.length);FS.write(stream,buf,0,actualNumBytes,undefined,opts.canOwn)}else if(ArrayBuffer.isView(data)){FS.write(stream,data,0,data.byteLength,undefined,opts.canOwn)}else{throw new Error("Unsupported data type")}FS.close(stream)},cwd:()=>FS.currentPath,chdir:path=>{var lookup=FS.lookupPath(path,{follow:true});if(lookup.node===null){throw new FS.ErrnoError(44)}if(!FS.isDir(lookup.node.mode)){throw new FS.ErrnoError(54)}var errCode=FS.nodePermissions(lookup.node,"x");if(errCode){throw new FS.ErrnoError(errCode)}FS.currentPath=lookup.path},createDefaultDirectories:()=>{FS.mkdir("/tmp");FS.mkdir("/home");FS.mkdir("/home/web_user")},createDefaultDevices:()=>{FS.mkdir("/dev");FS.registerDevice(FS.makedev(1,3),{read:()=>0,write:(stream,buffer,offset,length,pos)=>length});FS.mkdev("/dev/null",FS.makedev(1,3));TTY.register(FS.makedev(5,0),TTY.default_tty_ops);TTY.register(FS.makedev(6,0),TTY.default_tty1_ops);FS.mkdev("/dev/tty",FS.makedev(5,0));FS.mkdev("/dev/tty1",FS.makedev(6,0));var random_device=getRandomDevice();FS.createDevice("/dev","random",random_device);FS.createDevice("/dev","urandom",random_device);FS.mkdir("/dev/shm");FS.mkdir("/dev/shm/tmp")},createSpecialDirectories:()=>{FS.mkdir("/proc");var proc_self=FS.mkdir("/proc/self");FS.mkdir("/proc/self/fd");FS.mount({mount:()=>{var node=FS.createNode(proc_self,"fd",16384|511,73);node.node_ops={lookup:(parent,name)=>{var fd=+name;var stream=FS.getStream(fd);if(!stream)throw new FS.ErrnoError(8);var ret={parent:null,mount:{mountpoint:"fake"},node_ops:{readlink:()=>stream.path}};ret.parent=ret;return ret}};return node}},{},"/proc/self/fd")},createStandardStreams:()=>{if(Module["stdin"]){FS.createDevice("/dev","stdin",Module["stdin"])}else{FS.symlink("/dev/tty","/dev/stdin")}if(Module["stdout"]){FS.createDevice("/dev","stdout",null,Module["stdout"])}else{FS.symlink("/dev/tty","/dev/stdout")}if(Module["stderr"]){FS.createDevice("/dev","stderr",null,Module["stderr"])}else{FS.symlink("/dev/tty1","/dev/stderr")}var stdin=FS.open("/dev/stdin",0);var stdout=FS.open("/dev/stdout",1);var stderr=FS.open("/dev/stderr",1)},ensureErrnoError:()=>{if(FS.ErrnoError)return;FS.ErrnoError=function ErrnoError(errno,node){this.name="ErrnoError";this.node=node;this.setErrno=function(errno){this.errno=errno};this.setErrno(errno);this.message="FS error"};FS.ErrnoError.prototype=new Error;FS.ErrnoError.prototype.constructor=FS.ErrnoError;[44].forEach(code=>{FS.genericErrors[code]=new FS.ErrnoError(code);FS.genericErrors[code].stack="<generic error, no stack>"})},staticInit:()=>{FS.ensureErrnoError();FS.nameTable=new Array(4096);FS.mount(MEMFS,{},"/");FS.createDefaultDirectories();FS.createDefaultDevices();FS.createSpecialDirectories();FS.filesystems={"MEMFS":MEMFS}},init:(input,output,error)=>{FS.init.initialized=true;FS.ensureErrnoError();Module["stdin"]=input||Module["stdin"];Module["stdout"]=output||Module["stdout"];Module["stderr"]=error||Module["stderr"];FS.createStandardStreams()},quit:()=>{FS.init.initialized=false;for(var i=0;i<FS.streams.length;i++){var stream=FS.streams[i];if(!stream){continue}FS.close(stream)}},getMode:(canRead,canWrite)=>{var mode=0;if(canRead)mode|=292|73;if(canWrite)mode|=146;return mode},findObject:(path,dontResolveLastLink)=>{var ret=FS.analyzePath(path,dontResolveLastLink);if(!ret.exists){return null}return ret.object},analyzePath:(path,dontResolveLastLink)=>{try{var lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});path=lookup.path}catch(e){}var ret={isRoot:false,exists:false,error:0,name:null,path:null,object:null,parentExists:false,parentPath:null,parentObject:null};try{var lookup=FS.lookupPath(path,{parent:true});ret.parentExists=true;ret.parentPath=lookup.path;ret.parentObject=lookup.node;ret.name=PATH.basename(path);lookup=FS.lookupPath(path,{follow:!dontResolveLastLink});ret.exists=true;ret.path=lookup.path;ret.object=lookup.node;ret.name=lookup.node.name;ret.isRoot=lookup.path==="/"}catch(e){ret.error=e.errno}return ret},createPath:(parent,path,canRead,canWrite)=>{parent=typeof parent=="string"?parent:FS.getPath(parent);var parts=path.split("/").reverse();while(parts.length){var part=parts.pop();if(!part)continue;var current=PATH.join2(parent,part);try{FS.mkdir(current)}catch(e){}parent=current}return current},createFile:(parent,name,properties,canRead,canWrite)=>{var path=PATH.join2(typeof parent=="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(canRead,canWrite);return FS.create(path,mode)},createDataFile:(parent,name,data,canRead,canWrite,canOwn)=>{var path=name;if(parent){parent=typeof parent=="string"?parent:FS.getPath(parent);path=name?PATH.join2(parent,name):parent}var mode=FS.getMode(canRead,canWrite);var node=FS.create(path,mode);if(data){if(typeof data=="string"){var arr=new Array(data.length);for(var i=0,len=data.length;i<len;++i)arr[i]=data.charCodeAt(i);data=arr}FS.chmod(node,mode|146);var stream=FS.open(node,577);FS.write(stream,data,0,data.length,0,canOwn);FS.close(stream);FS.chmod(node,mode)}return node},createDevice:(parent,name,input,output)=>{var path=PATH.join2(typeof parent=="string"?parent:FS.getPath(parent),name);var mode=FS.getMode(!!input,!!output);if(!FS.createDevice.major)FS.createDevice.major=64;var dev=FS.makedev(FS.createDevice.major++,0);FS.registerDevice(dev,{open:stream=>{stream.seekable=false},close:stream=>{if(output&&output.buffer&&output.buffer.length){output(10)}},read:(stream,buffer,offset,length,pos)=>{var bytesRead=0;for(var i=0;i<length;i++){var result;try{result=input()}catch(e){throw new FS.ErrnoError(29)}if(result===undefined&&bytesRead===0){throw new FS.ErrnoError(6)}if(result===null||result===undefined)break;bytesRead++;buffer[offset+i]=result}if(bytesRead){stream.node.timestamp=Date.now()}return bytesRead},write:(stream,buffer,offset,length,pos)=>{for(var i=0;i<length;i++){try{output(buffer[offset+i])}catch(e){throw new FS.ErrnoError(29)}}if(length){stream.node.timestamp=Date.now()}return i}});return FS.mkdev(path,mode,dev)},forceLoadFile:obj=>{if(obj.isDevice||obj.isFolder||obj.link||obj.contents)return true;if(typeof XMLHttpRequest!="undefined"){throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.")}else if(read_){try{obj.contents=intArrayFromString(read_(obj.url),true);obj.usedBytes=obj.contents.length}catch(e){throw new FS.ErrnoError(29)}}else{throw new Error("Cannot load without read() or XMLHttpRequest.")}},createLazyFile:(parent,name,url,canRead,canWrite)=>{function LazyUint8Array(){this.lengthKnown=false;this.chunks=[]}LazyUint8Array.prototype.get=function LazyUint8Array_get(idx){if(idx>this.length-1||idx<0){return undefined}var chunkOffset=idx%this.chunkSize;var chunkNum=idx/this.chunkSize|0;return this.getter(chunkNum)[chunkOffset]};LazyUint8Array.prototype.setDataGetter=function LazyUint8Array_setDataGetter(getter){this.getter=getter};LazyUint8Array.prototype.cacheLength=function LazyUint8Array_cacheLength(){var xhr=new XMLHttpRequest;xhr.open("HEAD",url,false);xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);var datalength=Number(xhr.getResponseHeader("Content-length"));var header;var hasByteServing=(header=xhr.getResponseHeader("Accept-Ranges"))&&header==="bytes";var usesGzip=(header=xhr.getResponseHeader("Content-Encoding"))&&header==="gzip";var chunkSize=1024*1024;if(!hasByteServing)chunkSize=datalength;var doXHR=(from,to)=>{if(from>to)throw new Error("invalid range ("+from+", "+to+") or no bytes requested!");if(to>datalength-1)throw new Error("only "+datalength+" bytes available! programmer error!");var xhr=new XMLHttpRequest;xhr.open("GET",url,false);if(datalength!==chunkSize)xhr.setRequestHeader("Range","bytes="+from+"-"+to);xhr.responseType="arraybuffer";if(xhr.overrideMimeType){xhr.overrideMimeType("text/plain; charset=x-user-defined")}xhr.send(null);if(!(xhr.status>=200&&xhr.status<300||xhr.status===304))throw new Error("Couldn't load "+url+". Status: "+xhr.status);if(xhr.response!==undefined){return new Uint8Array(xhr.response||[])}return intArrayFromString(xhr.responseText||"",true)};var lazyArray=this;lazyArray.setDataGetter(chunkNum=>{var start=chunkNum*chunkSize;var end=(chunkNum+1)*chunkSize-1;end=Math.min(end,datalength-1);if(typeof lazyArray.chunks[chunkNum]=="undefined"){lazyArray.chunks[chunkNum]=doXHR(start,end)}if(typeof lazyArray.chunks[chunkNum]=="undefined")throw new Error("doXHR failed!");return lazyArray.chunks[chunkNum]});if(usesGzip||!datalength){chunkSize=datalength=1;datalength=this.getter(0).length;chunkSize=datalength;out("LazyFiles on gzip forces download of the whole file when length is accessed")}this._length=datalength;this._chunkSize=chunkSize;this.lengthKnown=true};if(typeof XMLHttpRequest!="undefined"){if(!ENVIRONMENT_IS_WORKER)throw"Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";var lazyArray=new LazyUint8Array;Object.defineProperties(lazyArray,{length:{get:function(){if(!this.lengthKnown){this.cacheLength()}return this._length}},chunkSize:{get:function(){if(!this.lengthKnown){this.cacheLength()}return this._chunkSize}}});var properties={isDevice:false,contents:lazyArray}}else{var properties={isDevice:false,url:url}}var node=FS.createFile(parent,name,properties,canRead,canWrite);if(properties.contents){node.contents=properties.contents}else if(properties.url){node.contents=null;node.url=properties.url}Object.defineProperties(node,{usedBytes:{get:function(){return this.contents.length}}});var stream_ops={};var keys=Object.keys(node.stream_ops);keys.forEach(key=>{var fn=node.stream_ops[key];stream_ops[key]=function forceLoadLazyFile(){FS.forceLoadFile(node);return fn.apply(null,arguments)}});function writeChunks(stream,buffer,offset,length,position){var contents=stream.node.contents;if(position>=contents.length)return 0;var size=Math.min(contents.length-position,length);if(contents.slice){for(var i=0;i<size;i++){buffer[offset+i]=contents[position+i]}}else{for(var i=0;i<size;i++){buffer[offset+i]=contents.get(position+i)}}return size}stream_ops.read=(stream,buffer,offset,length,position)=>{FS.forceLoadFile(node);return writeChunks(stream,buffer,offset,length,position)};stream_ops.mmap=(stream,length,position,prot,flags)=>{FS.forceLoadFile(node);var ptr=mmapAlloc(length);if(!ptr){throw new FS.ErrnoError(48)}writeChunks(stream,HEAP8,ptr,length,position);return{ptr:ptr,allocated:true}};node.stream_ops=stream_ops;return node},createPreloadedFile:(parent,name,url,canRead,canWrite,onload,onerror,dontCreateFile,canOwn,preFinish)=>{var fullname=name?PATH_FS.resolve(PATH.join2(parent,name)):parent;var dep=getUniqueRunDependency("cp "+fullname);function processData(byteArray){function finish(byteArray){if(preFinish)preFinish();if(!dontCreateFile){FS.createDataFile(parent,name,byteArray,canRead,canWrite,canOwn)}if(onload)onload();removeRunDependency(dep)}if(Browser.handledByPreloadPlugin(byteArray,fullname,finish,()=>{if(onerror)onerror();removeRunDependency(dep)})){return}finish(byteArray)}addRunDependency(dep);if(typeof url=="string"){asyncLoad(url,byteArray=>processData(byteArray),onerror)}else{processData(url)}},indexedDB:()=>{return window.indexedDB||window.mozIndexedDB||window.webkitIndexedDB||window.msIndexedDB},DB_NAME:()=>{return"EM_FS_"+window.location.pathname},DB_VERSION:20,DB_STORE_NAME:"FILE_DATA",saveFilesToDB:(paths,onload=(()=>{}),onerror=(()=>{}))=>{var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION)}catch(e){return onerror(e)}openRequest.onupgradeneeded=()=>{out("creating db");var db=openRequest.result;db.createObjectStore(FS.DB_STORE_NAME)};openRequest.onsuccess=()=>{var db=openRequest.result;var transaction=db.transaction([FS.DB_STORE_NAME],"readwrite");var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror()}paths.forEach(path=>{var putRequest=files.put(FS.analyzePath(path).object.contents,path);putRequest.onsuccess=()=>{ok++;if(ok+fail==total)finish()};putRequest.onerror=()=>{fail++;if(ok+fail==total)finish()}});transaction.onerror=onerror};openRequest.onerror=onerror},loadFilesFromDB:(paths,onload=(()=>{}),onerror=(()=>{}))=>{var indexedDB=FS.indexedDB();try{var openRequest=indexedDB.open(FS.DB_NAME(),FS.DB_VERSION)}catch(e){return onerror(e)}openRequest.onupgradeneeded=onerror;openRequest.onsuccess=()=>{var db=openRequest.result;try{var transaction=db.transaction([FS.DB_STORE_NAME],"readonly")}catch(e){onerror(e);return}var files=transaction.objectStore(FS.DB_STORE_NAME);var ok=0,fail=0,total=paths.length;function finish(){if(fail==0)onload();else onerror()}paths.forEach(path=>{var getRequest=files.get(path);getRequest.onsuccess=()=>{if(FS.analyzePath(path).exists){FS.unlink(path)}FS.createDataFile(PATH.dirname(path),PATH.basename(path),getRequest.result,true,true,true);ok++;if(ok+fail==total)finish()};getRequest.onerror=()=>{fail++;if(ok+fail==total)finish()}});transaction.onerror=onerror};openRequest.onerror=onerror}};var SYSCALLS={DEFAULT_POLLMASK:5,calculateAt:function(dirfd,path,allowEmpty){if(PATH.isAbs(path)){return path}var dir;if(dirfd===-100){dir=FS.cwd()}else{var dirstream=SYSCALLS.getStreamFromFD(dirfd);dir=dirstream.path}if(path.length==0){if(!allowEmpty){throw new FS.ErrnoError(44)}return dir}return PATH.join2(dir,path)},doStat:function(func,path,buf){try{var stat=func(path)}catch(e){if(e&&e.node&&PATH.normalize(path)!==PATH.normalize(FS.getPath(e.node))){return-54}throw e}HEAP32[buf>>2]=stat.dev;HEAP32[buf+8>>2]=stat.ino;HEAP32[buf+12>>2]=stat.mode;HEAPU32[buf+16>>2]=stat.nlink;HEAP32[buf+20>>2]=stat.uid;HEAP32[buf+24>>2]=stat.gid;HEAP32[buf+28>>2]=stat.rdev;tempI64=[stat.size>>>0,(tempDouble=stat.size,+Math.abs(tempDouble)>=1?tempDouble>0?(Math.min(+Math.floor(tempDouble/4294967296),4294967295)|0)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[buf+40>>2]=tempI64[0],HEAP32[buf+44>>2]=tempI64[1];HEAP32[buf+48>>2]=4096;HEAP32[buf+52>>2]=stat.blocks;var atime=stat.atime.getTime();var mtime=stat.mtime.getTime();var ctime=stat.ctime.getTime();tempI64=[Math.floor(atime/1e3)>>>0,(tempDouble=Math.floor(atime/1e3),+Math.abs(tempDouble)>=1?tempDouble>0?(Math.min(+Math.floor(tempDouble/4294967296),4294967295)|0)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[buf+56>>2]=tempI64[0],HEAP32[buf+60>>2]=tempI64[1];HEAPU32[buf+64>>2]=atime%1e3*1e3;tempI64=[Math.floor(mtime/1e3)>>>0,(tempDouble=Math.floor(mtime/1e3),+Math.abs(tempDouble)>=1?tempDouble>0?(Math.min(+Math.floor(tempDouble/4294967296),4294967295)|0)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[buf+72>>2]=tempI64[0],HEAP32[buf+76>>2]=tempI64[1];HEAPU32[buf+80>>2]=mtime%1e3*1e3;tempI64=[Math.floor(ctime/1e3)>>>0,(tempDouble=Math.floor(ctime/1e3),+Math.abs(tempDouble)>=1?tempDouble>0?(Math.min(+Math.floor(tempDouble/4294967296),4294967295)|0)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[buf+88>>2]=tempI64[0],HEAP32[buf+92>>2]=tempI64[1];HEAPU32[buf+96>>2]=ctime%1e3*1e3;tempI64=[stat.ino>>>0,(tempDouble=stat.ino,+Math.abs(tempDouble)>=1?tempDouble>0?(Math.min(+Math.floor(tempDouble/4294967296),4294967295)|0)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[buf+104>>2]=tempI64[0],HEAP32[buf+108>>2]=tempI64[1];return 0},doMsync:function(addr,stream,len,flags,offset){if(!FS.isFile(stream.node.mode)){throw new FS.ErrnoError(43)}if(flags&2){return 0}var buffer=HEAPU8.slice(addr,addr+len);FS.msync(stream,buffer,offset,len,flags)},varargs:undefined,get:function(){SYSCALLS.varargs+=4;var ret=HEAP32[SYSCALLS.varargs-4>>2];return ret},getStr:function(ptr){var ret=UTF8ToString(ptr);return ret},getStreamFromFD:function(fd){var stream=FS.getStream(fd);if(!stream)throw new FS.ErrnoError(8);return stream}};function _clock_time_get(clk_id,ignored_precision,ptime){if(!checkWasiClock(clk_id)){return 28}var now;if(clk_id===0){now=Date.now()}else if(nowIsMonotonic){now=_emscripten_get_now()}else{return 52}var nsec=Math.round(now*1e3*1e3);HEAP32[ptime>>2]=nsec>>>0;HEAP32[ptime+4>>2]=nsec/Math.pow(2,32)>>>0;return 0}function _emscripten_notify_memory_growth(memoryIndex){updateMemoryViews()}var ENV={};function getExecutableName(){return thisProgram||"./this.program"}function getEnvStrings(){if(!getEnvStrings.strings){var lang=(typeof navigator=="object"&&navigator.languages&&navigator.languages[0]||"C").replace("-","_")+".UTF-8";var env={"USER":"web_user","LOGNAME":"web_user","PATH":"/","PWD":"/","HOME":"/home/web_user","LANG":lang,"_":getExecutableName()};for(var x in ENV){if(ENV[x]===undefined)delete env[x];else env[x]=ENV[x]}var strings=[];for(var x in env){strings.push(x+"="+env[x])}getEnvStrings.strings=strings}return getEnvStrings.strings}function writeAsciiToMemory(str,buffer,dontAddNull){for(var i=0;i<str.length;++i){HEAP8[buffer++>>0]=str.charCodeAt(i)}if(!dontAddNull)HEAP8[buffer>>0]=0}function _environ_get(__environ,environ_buf){var bufSize=0;getEnvStrings().forEach(function(string,i){var ptr=environ_buf+bufSize;HEAPU32[__environ+i*4>>2]=ptr;writeAsciiToMemory(string,ptr);bufSize+=string.length+1});return 0}function _environ_sizes_get(penviron_count,penviron_buf_size){var strings=getEnvStrings();HEAPU32[penviron_count>>2]=strings.length;var bufSize=0;strings.forEach(function(string){bufSize+=string.length+1});HEAPU32[penviron_buf_size>>2]=bufSize;return 0}function _fd_close(fd){try{var stream=SYSCALLS.getStreamFromFD(fd);FS.close(stream);return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}function doReadv(stream,iov,iovcnt,offset){var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAPU32[iov>>2];var len=HEAPU32[iov+4>>2];iov+=8;var curr=FS.read(stream,HEAP8,ptr,len,offset);if(curr<0)return-1;ret+=curr;if(curr<len)break;if(typeof offset!=="undefined"){offset+=curr}}return ret}function _fd_read(fd,iov,iovcnt,pnum){try{var stream=SYSCALLS.getStreamFromFD(fd);var num=doReadv(stream,iov,iovcnt);HEAPU32[pnum>>2]=num;return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}var MAX_INT53=9007199254740992;var MIN_INT53=-9007199254740992;function bigintToI53Checked(num){return num<MIN_INT53||num>MAX_INT53?NaN:Number(num)}function _fd_seek(fd,offset,whence,newOffset){try{offset=bigintToI53Checked(offset);if(isNaN(offset))return 61;var stream=SYSCALLS.getStreamFromFD(fd);FS.llseek(stream,offset,whence);tempI64=[stream.position>>>0,(tempDouble=stream.position,+Math.abs(tempDouble)>=1?tempDouble>0?(Math.min(+Math.floor(tempDouble/4294967296),4294967295)|0)>>>0:~~+Math.ceil((tempDouble-+(~~tempDouble>>>0))/4294967296)>>>0:0)],HEAP32[newOffset>>2]=tempI64[0],HEAP32[newOffset+4>>2]=tempI64[1];if(stream.getdents&&offset===0&&whence===0)stream.getdents=null;return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}function doWritev(stream,iov,iovcnt,offset){var ret=0;for(var i=0;i<iovcnt;i++){var ptr=HEAPU32[iov>>2];var len=HEAPU32[iov+4>>2];iov+=8;var curr=FS.write(stream,HEAP8,ptr,len,offset);if(curr<0)return-1;ret+=curr;if(typeof offset!=="undefined"){offset+=curr}}return ret}function _fd_write(fd,iov,iovcnt,pnum){try{var stream=SYSCALLS.getStreamFromFD(fd);var num=doWritev(stream,iov,iovcnt);HEAPU32[pnum>>2]=num;return 0}catch(e){if(typeof FS=="undefined"||!(e.name==="ErrnoError"))throw e;return e.errno}}function _proc_exit(code){EXITSTATUS=code;if(!keepRuntimeAlive()){if(Module["onExit"])Module["onExit"](code);ABORT=true}quit_(code,new ExitStatus(code))}function exitJS(status,implicit){EXITSTATUS=status;_proc_exit(status)}function handleException(e){if(e instanceof ExitStatus||e=="unwind"){return EXITSTATUS}quit_(1,e)}var FSNode=function(parent,name,mode,rdev){if(!parent){parent=this}this.parent=parent;this.mount=parent.mount;this.mounted=null;this.id=FS.nextInode++;this.name=name;this.mode=mode;this.node_ops={};this.stream_ops={};this.rdev=rdev};var readMode=292|73;var writeMode=146;Object.defineProperties(FSNode.prototype,{read:{get:function(){return(this.mode&readMode)===readMode},set:function(val){val?this.mode|=readMode:this.mode&=~readMode}},write:{get:function(){return(this.mode&writeMode)===writeMode},set:function(val){val?this.mode|=writeMode:this.mode&=~writeMode}},isFolder:{get:function(){return FS.isDir(this.mode)}},isDevice:{get:function(){return FS.isChrdev(this.mode)}}});FS.FSNode=FSNode;FS.staticInit();var wasmImports={"TVMWasmPackedCFunc":_TVMWasmPackedCFunc,"TVMWasmPackedCFuncFinalizer":_TVMWasmPackedCFuncFinalizer,"_ZN3tvm7runtime9threading10NumThreadsEv":__ZN3tvm7runtime9threading10NumThreadsEv,"_ZN3tvm7runtime9threading15ResetThreadPoolEv":__ZN3tvm7runtime9threading15ResetThreadPoolEv,"clock_time_get":_clock_time_get,"emscripten_notify_memory_growth":_emscripten_notify_memory_growth,"environ_get":_environ_get,"environ_sizes_get":_environ_sizes_get,"fd_close":_fd_close,"fd_read":_fd_read,"fd_seek":_fd_seek,"fd_write":_fd_write,"proc_exit":_proc_exit};var asm=createWasm();var __ZN3tvm7runtime17GetCustomTypeNameEh=Module["__ZN3tvm7runtime17GetCustomTypeNameEh"]=function(){return(__ZN3tvm7runtime17GetCustomTypeNameEh=Module["__ZN3tvm7runtime17GetCustomTypeNameEh"]=Module["asm"]["_ZN3tvm7runtime17GetCustomTypeNameEh"]).apply(null,arguments)};var __ZN3tvm7runtime8Registry3GetERKNS0_6StringE=Module["__ZN3tvm7runtime8Registry3GetERKNS0_6StringE"]=function(){return(__ZN3tvm7runtime8Registry3GetERKNS0_6StringE=Module["__ZN3tvm7runtime8Registry3GetERKNS0_6StringE"]=Module["asm"]["_ZN3tvm7runtime8Registry3GetERKNS0_6StringE"]).apply(null,arguments)};var __ZN3tvm7runtime23GetCustomTypeRegisteredEh=Module["__ZN3tvm7runtime23GetCustomTypeRegisteredEh"]=function(){return(__ZN3tvm7runtime23GetCustomTypeRegisteredEh=Module["__ZN3tvm7runtime23GetCustomTypeRegisteredEh"]=Module["asm"]["_ZN3tvm7runtime23GetCustomTypeRegisteredEh"]).apply(null,arguments)};var __ZN3tvm7runtime19ParseCustomDatatypeERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEPPKc=Module["__ZN3tvm7runtime19ParseCustomDatatypeERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEPPKc"]=function(){return(__ZN3tvm7runtime19ParseCustomDatatypeERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEPPKc=Module["__ZN3tvm7runtime19ParseCustomDatatypeERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEPPKc"]=Module["asm"]["_ZN3tvm7runtime19ParseCustomDatatypeERKNSt3__212basic_stringIcNS1_11char_traitsIcEENS1_9allocatorIcEEEEPPKc"]).apply(null,arguments)};var _TVMGetLastError=Module["_TVMGetLastError"]=function(){return(_TVMGetLastError=Module["_TVMGetLastError"]=Module["asm"]["TVMGetLastError"]).apply(null,arguments)};var _TVMAPISetLastError=Module["_TVMAPISetLastError"]=function(){return(_TVMAPISetLastError=Module["_TVMAPISetLastError"]=Module["asm"]["TVMAPISetLastError"]).apply(null,arguments)};var _TVMModLoadFromFile=Module["_TVMModLoadFromFile"]=function(){return(_TVMModLoadFromFile=Module["_TVMModLoadFromFile"]=Module["asm"]["TVMModLoadFromFile"]).apply(null,arguments)};var __ZN3tvm7runtime6Module12LoadFromFileERKNS0_6StringES4_=Module["__ZN3tvm7runtime6Module12LoadFromFileERKNS0_6StringES4_"]=function(){return(__ZN3tvm7runtime6Module12LoadFromFileERKNS0_6StringES4_=Module["__ZN3tvm7runtime6Module12LoadFromFileERKNS0_6StringES4_"]=Module["asm"]["_ZN3tvm7runtime6Module12LoadFromFileERKNS0_6StringES4_"]).apply(null,arguments)};var _TVMModImport=Module["_TVMModImport"]=function(){return(_TVMModImport=Module["_TVMModImport"]=Module["asm"]["TVMModImport"]).apply(null,arguments)};var _TVMModGetFunction=Module["_TVMModGetFunction"]=function(){return(_TVMModGetFunction=Module["_TVMModGetFunction"]=Module["asm"]["TVMModGetFunction"]).apply(null,arguments)};var _TVMModFree=Module["_TVMModFree"]=function(){return(_TVMModFree=Module["_TVMModFree"]=Module["asm"]["TVMModFree"]).apply(null,arguments)};var _TVMObjectFree=Module["_TVMObjectFree"]=function(){return(_TVMObjectFree=Module["_TVMObjectFree"]=Module["asm"]["TVMObjectFree"]).apply(null,arguments)};var _TVMBackendGetFuncFromEnv=Module["_TVMBackendGetFuncFromEnv"]=function(){return(_TVMBackendGetFuncFromEnv=Module["_TVMBackendGetFuncFromEnv"]=Module["asm"]["TVMBackendGetFuncFromEnv"]).apply(null,arguments)};var _TVMBackendAllocWorkspace=Module["_TVMBackendAllocWorkspace"]=function(){return(_TVMBackendAllocWorkspace=Module["_TVMBackendAllocWorkspace"]=Module["asm"]["TVMBackendAllocWorkspace"]).apply(null,arguments)};var _TVMBackendFreeWorkspace=Module["_TVMBackendFreeWorkspace"]=function(){return(_TVMBackendFreeWorkspace=Module["_TVMBackendFreeWorkspace"]=Module["asm"]["TVMBackendFreeWorkspace"]).apply(null,arguments)};var _TVMBackendRunOnce=Module["_TVMBackendRunOnce"]=function(){return(_TVMBackendRunOnce=Module["_TVMBackendRunOnce"]=Module["asm"]["TVMBackendRunOnce"]).apply(null,arguments)};var _TVMFuncFree=Module["_TVMFuncFree"]=function(){return(_TVMFuncFree=Module["_TVMFuncFree"]=Module["asm"]["TVMFuncFree"]).apply(null,arguments)};var _TVMByteArrayFree=Module["_TVMByteArrayFree"]=function(){return(_TVMByteArrayFree=Module["_TVMByteArrayFree"]=Module["asm"]["TVMByteArrayFree"]).apply(null,arguments)};var _TVMFuncCall=Module["_TVMFuncCall"]=function(){return(_TVMFuncCall=Module["_TVMFuncCall"]=Module["asm"]["TVMFuncCall"]).apply(null,arguments)};var _TVMCFuncSetReturn=Module["_TVMCFuncSetReturn"]=function(){return(_TVMCFuncSetReturn=Module["_TVMCFuncSetReturn"]=Module["asm"]["TVMCFuncSetReturn"]).apply(null,arguments)};var _TVMFuncCreateFromCFunc=Module["_TVMFuncCreateFromCFunc"]=function(){return(_TVMFuncCreateFromCFunc=Module["_TVMFuncCreateFromCFunc"]=Module["asm"]["TVMFuncCreateFromCFunc"]).apply(null,arguments)};var _TVMStreamCreate=Module["_TVMStreamCreate"]=function(){return(_TVMStreamCreate=Module["_TVMStreamCreate"]=Module["asm"]["TVMStreamCreate"]).apply(null,arguments)};var _TVMStreamFree=Module["_TVMStreamFree"]=function(){return(_TVMStreamFree=Module["_TVMStreamFree"]=Module["asm"]["TVMStreamFree"]).apply(null,arguments)};var _TVMSetStream=Module["_TVMSetStream"]=function(){return(_TVMSetStream=Module["_TVMSetStream"]=Module["asm"]["TVMSetStream"]).apply(null,arguments)};var _TVMSynchronize=Module["_TVMSynchronize"]=function(){return(_TVMSynchronize=Module["_TVMSynchronize"]=Module["asm"]["TVMSynchronize"]).apply(null,arguments)};var _TVMStreamStreamSynchronize=Module["_TVMStreamStreamSynchronize"]=function(){return(_TVMStreamStreamSynchronize=Module["_TVMStreamStreamSynchronize"]=Module["asm"]["TVMStreamStreamSynchronize"]).apply(null,arguments)};var _TVMCbArgToReturn=Module["_TVMCbArgToReturn"]=function(){return(_TVMCbArgToReturn=Module["_TVMCbArgToReturn"]=Module["asm"]["TVMCbArgToReturn"]).apply(null,arguments)};var _TVMDeviceAllocDataSpace=Module["_TVMDeviceAllocDataSpace"]=function(){return(_TVMDeviceAllocDataSpace=Module["_TVMDeviceAllocDataSpace"]=Module["asm"]["TVMDeviceAllocDataSpace"]).apply(null,arguments)};var _TVMDeviceAllocDataSpaceWithScope=Module["_TVMDeviceAllocDataSpaceWithScope"]=function(){return(_TVMDeviceAllocDataSpaceWithScope=Module["_TVMDeviceAllocDataSpaceWithScope"]=Module["asm"]["TVMDeviceAllocDataSpaceWithScope"]).apply(null,arguments)};var _TVMDeviceFreeDataSpace=Module["_TVMDeviceFreeDataSpace"]=function(){return(_TVMDeviceFreeDataSpace=Module["_TVMDeviceFreeDataSpace"]=Module["asm"]["TVMDeviceFreeDataSpace"]).apply(null,arguments)};var _TVMDeviceCopyDataFromTo=Module["_TVMDeviceCopyDataFromTo"]=function(){return(_TVMDeviceCopyDataFromTo=Module["_TVMDeviceCopyDataFromTo"]=Module["asm"]["TVMDeviceCopyDataFromTo"]).apply(null,arguments)};var __ZN3tvm7runtime8Registry8RegisterERKNS0_6StringEb=Module["__ZN3tvm7runtime8Registry8RegisterERKNS0_6StringEb"]=function(){return(__ZN3tvm7runtime8Registry8RegisterERKNS0_6StringEb=Module["__ZN3tvm7runtime8Registry8RegisterERKNS0_6StringEb"]=Module["asm"]["_ZN3tvm7runtime8Registry8RegisterERKNS0_6StringEb"]).apply(null,arguments)};var _TVMBackendParallelLaunch=Module["_TVMBackendParallelLaunch"]=function(){return(_TVMBackendParallelLaunch=Module["_TVMBackendParallelLaunch"]=Module["asm"]["TVMBackendParallelLaunch"]).apply(null,arguments)};var _TVMBackendParallelBarrier=Module["_TVMBackendParallelBarrier"]=function(){return(_TVMBackendParallelBarrier=Module["_TVMBackendParallelBarrier"]=Module["asm"]["TVMBackendParallelBarrier"]).apply(null,arguments)};var __ZN3tvm7runtime8Registry9ListNamesEv=Module["__ZN3tvm7runtime8Registry9ListNamesEv"]=function(){return(__ZN3tvm7runtime8Registry9ListNamesEv=Module["__ZN3tvm7runtime8Registry9ListNamesEv"]=Module["asm"]["_ZN3tvm7runtime8Registry9ListNamesEv"]).apply(null,arguments)};var __ZN3tvm7runtime9BacktraceEv=Module["__ZN3tvm7runtime9BacktraceEv"]=function(){return(__ZN3tvm7runtime9BacktraceEv=Module["__ZN3tvm7runtime9BacktraceEv"]=Module["asm"]["_ZN3tvm7runtime9BacktraceEv"]).apply(null,arguments)};var __ZN3tvm7runtime14RuntimeEnabledERKNS0_6StringE=Module["__ZN3tvm7runtime14RuntimeEnabledERKNS0_6StringE"]=function(){return(__ZN3tvm7runtime14RuntimeEnabledERKNS0_6StringE=Module["__ZN3tvm7runtime14RuntimeEnabledERKNS0_6StringE"]=Module["asm"]["_ZN3tvm7runtime14RuntimeEnabledERKNS0_6StringE"]).apply(null,arguments)};var __ZN3tvm7runtime7NDArray10CreateViewENS0_10ShapeTupleE10DLDataType=Module["__ZN3tvm7runtime7NDArray10CreateViewENS0_10ShapeTupleE10DLDataType"]=function(){return(__ZN3tvm7runtime7NDArray10CreateViewENS0_10ShapeTupleE10DLDataType=Module["__ZN3tvm7runtime7NDArray10CreateViewENS0_10ShapeTupleE10DLDataType"]=Module["asm"]["_ZN3tvm7runtime7NDArray10CreateViewENS0_10ShapeTupleE10DLDataType"]).apply(null,arguments)};var __ZNK3tvm7runtime7NDArray8ToDLPackEv=Module["__ZNK3tvm7runtime7NDArray8ToDLPackEv"]=function(){return(__ZNK3tvm7runtime7NDArray8ToDLPackEv=Module["__ZNK3tvm7runtime7NDArray8ToDLPackEv"]=Module["asm"]["_ZNK3tvm7runtime7NDArray8ToDLPackEv"]).apply(null,arguments)};var __ZN3tvm7runtime7NDArray5EmptyENS0_10ShapeTupleE10DLDataType8DLDeviceNS0_8OptionalINS0_6StringEEE=Module["__ZN3tvm7runtime7NDArray5EmptyENS0_10ShapeTupleE10DLDataType8DLDeviceNS0_8OptionalINS0_6StringEEE"]=function(){return(__ZN3tvm7runtime7NDArray5EmptyENS0_10ShapeTupleE10DLDataType8DLDeviceNS0_8OptionalINS0_6StringEEE=Module["__ZN3tvm7runtime7NDArray5EmptyENS0_10ShapeTupleE10DLDataType8DLDeviceNS0_8OptionalINS0_6StringEEE"]=Module["asm"]["_ZN3tvm7runtime7NDArray5EmptyENS0_10ShapeTupleE10DLDataType8DLDeviceNS0_8OptionalINS0_6StringEEE"]).apply(null,arguments)};var __ZN3tvm7runtime7NDArray20FromExternalDLTensorERK8DLTensor=Module["__ZN3tvm7runtime7NDArray20FromExternalDLTensorERK8DLTensor"]=function(){return(__ZN3tvm7runtime7NDArray20FromExternalDLTensorERK8DLTensor=Module["__ZN3tvm7runtime7NDArray20FromExternalDLTensorERK8DLTensor"]=Module["asm"]["_ZN3tvm7runtime7NDArray20FromExternalDLTensorERK8DLTensor"]).apply(null,arguments)};var __ZN3tvm7runtime7NDArray9IsAlignedERK8DLTensor=Module["__ZN3tvm7runtime7NDArray9IsAlignedERK8DLTensor"]=function(){return(__ZN3tvm7runtime7NDArray9IsAlignedERK8DLTensor=Module["__ZN3tvm7runtime7NDArray9IsAlignedERK8DLTensor"]=Module["asm"]["_ZN3tvm7runtime7NDArray9IsAlignedERK8DLTensor"]).apply(null,arguments)};var __ZN3tvm7runtime7NDArray15NewFromDLTensorEP8DLTensorRK8DLDevice=Module["__ZN3tvm7runtime7NDArray15NewFromDLTensorEP8DLTensorRK8DLDevice"]=function(){return(__ZN3tvm7runtime7NDArray15NewFromDLTensorEP8DLTensorRK8DLDevice=Module["__ZN3tvm7runtime7NDArray15NewFromDLTensorEP8DLTensorRK8DLDevice"]=Module["asm"]["_ZN3tvm7runtime7NDArray15NewFromDLTensorEP8DLTensorRK8DLDevice"]).apply(null,arguments)};var __ZN3tvm7runtime7NDArray10FromDLPackEP15DLManagedTensor=Module["__ZN3tvm7runtime7NDArray10FromDLPackEP15DLManagedTensor"]=function(){return(__ZN3tvm7runtime7NDArray10FromDLPackEP15DLManagedTensor=Module["__ZN3tvm7runtime7NDArray10FromDLPackEP15DLManagedTensor"]=Module["asm"]["_ZN3tvm7runtime7NDArray10FromDLPackEP15DLManagedTensor"]).apply(null,arguments)};var __ZNK3tvm7runtime7NDArray11CopyToBytesEPvm=Module["__ZNK3tvm7runtime7NDArray11CopyToBytesEPvm"]=function(){return(__ZNK3tvm7runtime7NDArray11CopyToBytesEPvm=Module["__ZNK3tvm7runtime7NDArray11CopyToBytesEPvm"]=Module["asm"]["_ZNK3tvm7runtime7NDArray11CopyToBytesEPvm"]).apply(null,arguments)};var __ZN3tvm7runtime7NDArray13CopyFromBytesEPKvm=Module["__ZN3tvm7runtime7NDArray13CopyFromBytesEPKvm"]=function(){return(__ZN3tvm7runtime7NDArray13CopyFromBytesEPKvm=Module["__ZN3tvm7runtime7NDArray13CopyFromBytesEPKvm"]=Module["asm"]["_ZN3tvm7runtime7NDArray13CopyFromBytesEPKvm"]).apply(null,arguments)};var __ZN3tvm7runtime7NDArray10CopyFromToEPK8DLTensorPS2_Pv=Module["__ZN3tvm7runtime7NDArray10CopyFromToEPK8DLTensorPS2_Pv"]=function(){return(__ZN3tvm7runtime7NDArray10CopyFromToEPK8DLTensorPS2_Pv=Module["__ZN3tvm7runtime7NDArray10CopyFromToEPK8DLTensorPS2_Pv"]=Module["asm"]["_ZN3tvm7runtime7NDArray10CopyFromToEPK8DLTensorPS2_Pv"]).apply(null,arguments)};var __ZNK3tvm7runtime7NDArray5ShapeEv=Module["__ZNK3tvm7runtime7NDArray5ShapeEv"]=function(){return(__ZNK3tvm7runtime7NDArray5ShapeEv=Module["__ZNK3tvm7runtime7NDArray5ShapeEv"]=Module["asm"]["_ZNK3tvm7runtime7NDArray5ShapeEv"]).apply(null,arguments)};var __ZNK3tvm7runtime7NDArray8DataTypeEv=Module["__ZNK3tvm7runtime7NDArray8DataTypeEv"]=function(){return(__ZNK3tvm7runtime7NDArray8DataTypeEv=Module["__ZNK3tvm7runtime7NDArray8DataTypeEv"]=Module["asm"]["_ZNK3tvm7runtime7NDArray8DataTypeEv"]).apply(null,arguments)};var __ZN3tvm7runtime7NDArray28AbilityOfZeroCopyForDLTensorEP8DLTensorRK8DLDevice=Module["__ZN3tvm7runtime7NDArray28AbilityOfZeroCopyForDLTensorEP8DLTensorRK8DLDevice"]=function(){return(__ZN3tvm7runtime7NDArray28AbilityOfZeroCopyForDLTensorEP8DLTensorRK8DLDevice=Module["__ZN3tvm7runtime7NDArray28AbilityOfZeroCopyForDLTensorEP8DLTensorRK8DLDevice"]=Module["asm"]["_ZN3tvm7runtime7NDArray28AbilityOfZeroCopyForDLTensorEP8DLTensorRK8DLDevice"]).apply(null,arguments)};var _TVMArrayGetTypeIndex=Module["_TVMArrayGetTypeIndex"]=function(){return(_TVMArrayGetTypeIndex=Module["_TVMArrayGetTypeIndex"]=Module["asm"]["TVMArrayGetTypeIndex"]).apply(null,arguments)};var _TVMArrayAlloc=Module["_TVMArrayAlloc"]=function(){return(_TVMArrayAlloc=Module["_TVMArrayAlloc"]=Module["asm"]["TVMArrayAlloc"]).apply(null,arguments)};var _TVMArrayFree=Module["_TVMArrayFree"]=function(){return(_TVMArrayFree=Module["_TVMArrayFree"]=Module["asm"]["TVMArrayFree"]).apply(null,arguments)};var _TVMArrayCopyFromTo=Module["_TVMArrayCopyFromTo"]=function(){return(_TVMArrayCopyFromTo=Module["_TVMArrayCopyFromTo"]=Module["asm"]["TVMArrayCopyFromTo"]).apply(null,arguments)};var _TVMArrayFromDLPack=Module["_TVMArrayFromDLPack"]=function(){return(_TVMArrayFromDLPack=Module["_TVMArrayFromDLPack"]=Module["asm"]["TVMArrayFromDLPack"]).apply(null,arguments)};var _TVMArrayToDLPack=Module["_TVMArrayToDLPack"]=function(){return(_TVMArrayToDLPack=Module["_TVMArrayToDLPack"]=Module["asm"]["TVMArrayToDLPack"]).apply(null,arguments)};var _TVMDLManagedTensorCallDeleter=Module["_TVMDLManagedTensorCallDeleter"]=function(){return(_TVMDLManagedTensorCallDeleter=Module["_TVMDLManagedTensorCallDeleter"]=Module["asm"]["TVMDLManagedTensorCallDeleter"]).apply(null,arguments)};var _TVMArrayCopyFromBytes=Module["_TVMArrayCopyFromBytes"]=function(){return(_TVMArrayCopyFromBytes=Module["_TVMArrayCopyFromBytes"]=Module["asm"]["TVMArrayCopyFromBytes"]).apply(null,arguments)};var _TVMArrayCopyToBytes=Module["_TVMArrayCopyToBytes"]=function(){return(_TVMArrayCopyToBytes=Module["_TVMArrayCopyToBytes"]=Module["asm"]["TVMArrayCopyToBytes"]).apply(null,arguments)};var _TVMObjectGetTypeIndex=Module["_TVMObjectGetTypeIndex"]=function(){return(_TVMObjectGetTypeIndex=Module["_TVMObjectGetTypeIndex"]=Module["asm"]["TVMObjectGetTypeIndex"]).apply(null,arguments)};var _TVMObjectRetain=Module["_TVMObjectRetain"]=function(){return(_TVMObjectRetain=Module["_TVMObjectRetain"]=Module["asm"]["TVMObjectRetain"]).apply(null,arguments)};var _TVMObjectDerivedFrom=Module["_TVMObjectDerivedFrom"]=function(){return(_TVMObjectDerivedFrom=Module["_TVMObjectDerivedFrom"]=Module["asm"]["TVMObjectDerivedFrom"]).apply(null,arguments)};var _TVMObjectTypeKey2Index=Module["_TVMObjectTypeKey2Index"]=function(){return(_TVMObjectTypeKey2Index=Module["_TVMObjectTypeKey2Index"]=Module["asm"]["TVMObjectTypeKey2Index"]).apply(null,arguments)};var _TVMObjectTypeIndex2Key=Module["_TVMObjectTypeIndex2Key"]=function(){return(_TVMObjectTypeIndex2Key=Module["_TVMObjectTypeIndex2Key"]=Module["asm"]["TVMObjectTypeIndex2Key"]).apply(null,arguments)};var __ZN3tvm7runtime5Timer5StartE8DLDevice=Module["__ZN3tvm7runtime5Timer5StartE8DLDevice"]=function(){return(__ZN3tvm7runtime5Timer5StartE8DLDevice=Module["__ZN3tvm7runtime5Timer5StartE8DLDevice"]=Module["asm"]["_ZN3tvm7runtime5Timer5StartE8DLDevice"]).apply(null,arguments)};var __ZN3tvm7runtime8Registry8set_bodyENS0_10PackedFuncE=Module["__ZN3tvm7runtime8Registry8set_bodyENS0_10PackedFuncE"]=function(){return(__ZN3tvm7runtime8Registry8set_bodyENS0_10PackedFuncE=Module["__ZN3tvm7runtime8Registry8set_bodyENS0_10PackedFuncE"]=Module["asm"]["_ZN3tvm7runtime8Registry8set_bodyENS0_10PackedFuncE"]).apply(null,arguments)};var __ZN3tvm7runtime8Registry6RemoveERKNS0_6StringE=Module["__ZN3tvm7runtime8Registry6RemoveERKNS0_6StringE"]=function(){return(__ZN3tvm7runtime8Registry6RemoveERKNS0_6StringE=Module["__ZN3tvm7runtime8Registry6RemoveERKNS0_6StringE"]=Module["asm"]["_ZN3tvm7runtime8Registry6RemoveERKNS0_6StringE"]).apply(null,arguments)};var __ZN3tvm7runtime15EnvCheckSignalsEv=Module["__ZN3tvm7runtime15EnvCheckSignalsEv"]=function(){return(__ZN3tvm7runtime15EnvCheckSignalsEv=Module["__ZN3tvm7runtime15EnvCheckSignalsEv"]=Module["asm"]["_ZN3tvm7runtime15EnvCheckSignalsEv"]).apply(null,arguments)};var _TVMFuncRegisterGlobal=Module["_TVMFuncRegisterGlobal"]=function(){return(_TVMFuncRegisterGlobal=Module["_TVMFuncRegisterGlobal"]=Module["asm"]["TVMFuncRegisterGlobal"]).apply(null,arguments)};var _TVMFuncGetGlobal=Module["_TVMFuncGetGlobal"]=function(){return(_TVMFuncGetGlobal=Module["_TVMFuncGetGlobal"]=Module["asm"]["TVMFuncGetGlobal"]).apply(null,arguments)};var _TVMFuncListGlobalNames=Module["_TVMFuncListGlobalNames"]=function(){return(_TVMFuncListGlobalNames=Module["_TVMFuncListGlobalNames"]=Module["asm"]["TVMFuncListGlobalNames"]).apply(null,arguments)};var _TVMFuncRemoveGlobal=Module["_TVMFuncRemoveGlobal"]=function(){return(_TVMFuncRemoveGlobal=Module["_TVMFuncRemoveGlobal"]=Module["asm"]["TVMFuncRemoveGlobal"]).apply(null,arguments)};var _TVMBackendRegisterEnvCAPI=Module["_TVMBackendRegisterEnvCAPI"]=function(){return(_TVMBackendRegisterEnvCAPI=Module["_TVMBackendRegisterEnvCAPI"]=Module["asm"]["TVMBackendRegisterEnvCAPI"]).apply(null,arguments)};var _TVMBackendRegisterSystemLibSymbol=Module["_TVMBackendRegisterSystemLibSymbol"]=function(){return(_TVMBackendRegisterSystemLibSymbol=Module["_TVMBackendRegisterSystemLibSymbol"]=Module["asm"]["TVMBackendRegisterSystemLibSymbol"]).apply(null,arguments)};var _TVMBackendAnyListSetPackedArg=Module["_TVMBackendAnyListSetPackedArg"]=function(){return(_TVMBackendAnyListSetPackedArg=Module["_TVMBackendAnyListSetPackedArg"]=Module["asm"]["TVMBackendAnyListSetPackedArg"]).apply(null,arguments)};var _TVMBackendAnyListResetItem=Module["_TVMBackendAnyListResetItem"]=function(){return(_TVMBackendAnyListResetItem=Module["_TVMBackendAnyListResetItem"]=Module["asm"]["TVMBackendAnyListResetItem"]).apply(null,arguments)};var _TVMBackendAnyListMoveFromPackedReturn=Module["_TVMBackendAnyListMoveFromPackedReturn"]=function(){return(_TVMBackendAnyListMoveFromPackedReturn=Module["_TVMBackendAnyListMoveFromPackedReturn"]=Module["asm"]["TVMBackendAnyListMoveFromPackedReturn"]).apply(null,arguments)};var __ZN3tvm7runtime6detail12LogFatalImplERKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEiSA_=Module["__ZN3tvm7runtime6detail12LogFatalImplERKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEiSA_"]=function(){return(__ZN3tvm7runtime6detail12LogFatalImplERKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEiSA_=Module["__ZN3tvm7runtime6detail12LogFatalImplERKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEiSA_"]=Module["asm"]["_ZN3tvm7runtime6detail12LogFatalImplERKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEiSA_"]).apply(null,arguments)};var __ZN3tvm7runtime6detail14LogMessageImplERKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEiiSA_=Module["__ZN3tvm7runtime6detail14LogMessageImplERKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEiiSA_"]=function(){return(__ZN3tvm7runtime6detail14LogMessageImplERKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEiiSA_=Module["__ZN3tvm7runtime6detail14LogMessageImplERKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEiiSA_"]=Module["asm"]["_ZN3tvm7runtime6detail14LogMessageImplERKNSt3__212basic_stringIcNS2_11char_traitsIcEENS2_9allocatorIcEEEEiiSA_"]).apply(null,arguments)};var ___errno_location=function(){return(___errno_location=Module["asm"]["__errno_location"]).apply(null,arguments)};var _TVMWasmAllocSpace=Module["_TVMWasmAllocSpace"]=function(){return(_TVMWasmAllocSpace=Module["_TVMWasmAllocSpace"]=Module["asm"]["TVMWasmAllocSpace"]).apply(null,arguments)};var _TVMWasmFreeSpace=Module["_TVMWasmFreeSpace"]=function(){return(_TVMWasmFreeSpace=Module["_TVMWasmFreeSpace"]=Module["asm"]["TVMWasmFreeSpace"]).apply(null,arguments)};var _TVMWasmFuncCreateFromCFunc=Module["_TVMWasmFuncCreateFromCFunc"]=function(){return(_TVMWasmFuncCreateFromCFunc=Module["_TVMWasmFuncCreateFromCFunc"]=Module["asm"]["TVMWasmFuncCreateFromCFunc"]).apply(null,arguments)};var __initialize=Module["__initialize"]=function(){return(__initialize=Module["__initialize"]=Module["asm"]["_initialize"]).apply(null,arguments)};var ___cxa_is_pointer_type=function(){return(___cxa_is_pointer_type=Module["asm"]["__cxa_is_pointer_type"]).apply(null,arguments)};var calledRun;var mainArgs=undefined;dependenciesFulfilled=function runCaller(){if(!calledRun)run();if(!calledRun)dependenciesFulfilled=runCaller};function callMain(args=[]){var entryFunction=__initialize;mainArgs=[thisProgram].concat(args);try{entryFunction();var ret=0;exitJS(ret,true);return ret}catch(e){return handleException(e)}}function run(args=arguments_){if(runDependencies>0){return}preRun();if(runDependencies>0){return}function doRun(){if(calledRun)return;calledRun=true;Module["calledRun"]=true;if(ABORT)return;initRuntime();preMain();if(Module["onRuntimeInitialized"])Module["onRuntimeInitialized"]();if(shouldRunNow)callMain(args);postRun()}if(Module["setStatus"]){Module["setStatus"]("Running...");setTimeout(function(){setTimeout(function(){Module["setStatus"]("")},1);doRun()},1)}else{doRun()}}if(Module["preInit"]){if(typeof Module["preInit"]=="function")Module["preInit"]=[Module["preInit"]];while(Module["preInit"].length>0){Module["preInit"].pop()()}}var shouldRunNow=true;if(Module["noInitialRun"])shouldRunNow=false;run();

    this.Module = Module;
    this.start = Module.wasmLibraryProvider.start;
    this.imports = Module.wasmLibraryProvider.imports;
    this.wasiImport = this.imports["wasi_snapshot_preview1"];
}
import "./diffusion/tvmjs.bundle.js";
//import "./diffusion/stable_diffusion.js";
//import * from "./diffusion/stable_diffusion.js";
import init, { TokenizerWasm } from "./diffusion/tokenizers-wasm/tokenizers_wasm.js";


//let tvmjsGlobalEnv = {};






var initialized = false;
async function getTokenizer(name) {
    if (!initialized) {
		//console.log("DIFFUSION WORKER: tokenizer not yet initialized");
		await init();
    }
	let tokenizer_url = "https://huggingface.co/" + name + "/raw/main/tokenizer.json";
	//console.log("diffusion_worker: adding tokenizer URL to cache: ", tokenizer_url);
	await caches.open(cache_name).then((cache) => cache.add(tokenizer_url))
	
    // it seems 'name' here points to 'openai/clip-vit-large-patch14': https://huggingface.co/openai/clip-vit-large-patch14/raw/main/tokenizer.json
    const jsonText = await (await fetch(tokenizer_url)).text();  // could switch this to ./diffusion/tokenizer.json, it's already a file there
    return new TokenizerWasm(jsonText);
}

tvmjsGlobalEnv.getTokenizer = getTokenizer;


addEventListener('message', async (event) => {
	//console.log("DIFFUSION WORKER: RECEIVED MESSAGE");
	//console.log("DIFFUSION WORKER: event.data: ", event.data);
	
    const message = event.data;
	
	if(typeof message.cache_name == 'string'){
		//console.log("diffusion_worker: setting cache_name to: ", message.cache_name)
		cache_name = message.cache_name;
	}
	
	if(typeof message.action == 'string'){
		
		// Interrupt
		if(message.action == 'interrupt'){
			if(self.localStableDiffusionInst){
				if(typeof self.localStableDiffusionInst.reset != 'undefined'){
					self.interrupted = true;
					//console.log("diffusion_worker: INTERRUPT! -> calling self.localStableDiffusionInst.reset()");
					self.localStableDiffusionInst.reset();
				}
				else{
					//console.log("diffusion_worker: cannot interrupt stable diffusion:  self.localStableDiffusionInst.reset is undefined");
				}
				
			}

			return
		}
		
		// Stop
		else if(message.action == 'stop'){
			if(self.localStableDiffusionInst){
				
				if(typeof self.localStableDiffusionInst.dispose != 'undefined'){
					//console.log("diffusion_worker: STOP! -> calling self.localStableDiffusionInst.dispose()");
					self.localStableDiffusionInst.dispose();
				}
				else{
					//console.log("diffusion_worker: cannot stop stable diffusion:  self.localStableDiffusionInst.dispose is undefined");
				}
				
			}
			
			postMessage({'task':self.task,'action':'stop'});
		}
	}
	
	
	if(typeof message.task == 'undefined'){
		console.error("DIFFUSION WORKER: TASK WAS UNDEFINED");
	    self.postMessage({
	        status: "error",
			message: "diffusion worker: undefined task"
	    });
		return
	}
	
	
	try{
		if(typeof message.task == 'object' && message.task != null){
			my_task = message.task;
			
			if(typeof my_task.prompt == 'string' && my_task.prompt.length > 2){
				let prompt = my_task.prompt;
				let negative_prompt = '';
				let scheduler_id = 0;
				let vae_cycle = -1;
				if(typeof my_task.negative_prompt == 'string'){
					negative_prompt = my_task.negative_prompt;
				}
				if(typeof my_task.scheduler_id == 'number' && my_task.scheduler_id == 1){
					scheduler_id = 1;
				}
				if(typeof my_task.vae_cycle == 'number' && my_task.vae_cycle == 2){
					vae_cycle = 2;
				}
				//console.log("diffusion_worker: starting with prompt,negative_prompt,scheduler_id,vae_cycle: ", prompt,negative_prompt,scheduler_id,vae_cycle);
				tvmjsGlobalEnv.asyncOnGenerate(prompt,negative_prompt,scheduler_id,vae_cycle);
				
			}
			else{
			    self.postMessage({
			        status: "error",
					message: "diffusion worker: invalid prompt"
			    });
				console.error("diffusion_worker: invalid prompt. not string, or too short: ", my_task.prompt);
			}
			
			/*
		    self.postMessage({
				task: my_task,
		        status: "complete",
				message:"when is this received?"
		        //task: "automatic-speech-recognition",
		        //transcript: transcript,
		    });
			*/
			
		}
		else{
		    self.postMessage({
		        status: "error",
				message: "diffusion worker got invalid task"
		    });
			my_task = null;
		}
		
	}
	catch(err){
		console.error("diffusion worker: caught general error: ", err);
	    self.postMessage({
	        status: "error",
			message: "caught error in diffusion worker"
	    });
	}

});








/**
 * Wrapper to handle PNDM scheduler
 */
class TVMPNDMScheduler {
  constructor(schedulerConsts, latentShape, tvm, device, vm) {
    this.timestep = [];
    this.sampleCoeff = [];
    this.alphaDiff = [];
    this.modelOutputDenomCoeff = [];
    this.ets = [];
    this.schedulerFunc = [];
    this.currSample = undefined;
    this.tvm = tvm;

    // prebuild constants
    // principle: always detach for class members
    // to avoid recycling output scope.
    function loadConsts(output, dtype, input) {
      for (let t = 0; t < input.length; ++t) {
        output.push(
          tvm.detachFromCurrentScope(
            tvm.empty([], dtype, device).copyFrom([input[t]])
          )
        );
      }
    }
    loadConsts(this.timestep, "int32", schedulerConsts["timesteps"]);
    loadConsts(this.sampleCoeff, "float32", schedulerConsts["sample_coeff"]);
    loadConsts(this.alphaDiff, "float32", schedulerConsts["alpha_diff"]);
    loadConsts(
      this.modelOutputDenomCoeff, "float32",
      schedulerConsts["model_output_denom_coeff"]);

    for (let i = 0; i < 4; ++i) {
      this.ets.push(
        this.tvm.detachFromCurrentScope(
          this.tvm.empty(latentShape, "float32", device)
        )
      );
    }

    for (let i = 0; i < 5; ++i) {
      this.schedulerFunc.push(
        tvm.detachFromCurrentScope(
          vm.getFunction("pndm_scheduler_step_" + i.toString())
        )
      );
    }
  }

  dispose() {
	  //console.log("diffusion_worker: in dispose C");
	  if(this.logger){
	  	this.logger("diffusion_worker: in dispose C");
	  }
    for (let t = 0; t < this.timestep.length; ++t) {
      this.timestep[t].dispose();
      this.sampleCoeff[t].dispose();
      this.alphaDiff[t].dispose();
      this.modelOutputDenomCoeff[t].dispose();
    }

    for (let i = 0; i < this.schedulerFunc.length; ++i) {
      this.schedulerFunc[i].dispose();
    }

    if (this.currSample) {
      this.currSample.dispose();
    }
    for (let i = 0; i < this.ets.length; ++i) {
      this.ets[i].dispose();
    }
	//console.log("diffusion_worker: dispose done");
	postMessage({'task':my_task,'action':'interrupt'});
  }

  step(modelOutput, sample, counter) {
    // keep running history of last four inputs
    if (counter != 1) {
      this.ets.shift();
      this.ets.push(this.tvm.detachFromCurrentScope(
        modelOutput
      ));
    }
    if (counter == 0) {
      this.currSample = this.tvm.detachFromCurrentScope(
        sample
      );
    } else if (counter == 1) {
      sample = this.tvm.attachToCurrentScope(this.currSample);
      this.currSample = undefined;
    }

    const findex = counter < 4 ? counter : 4;
    const prevLatents = this.schedulerFunc[findex](
      sample,
      modelOutput,
      this.sampleCoeff[counter],
      this.alphaDiff[counter],
      this.modelOutputDenomCoeff[counter],
      this.ets[0],
      this.ets[1],
      this.ets[2],
      this.ets[3]
    );
    return prevLatents;
  }
}

/**
 * Wrapper to handle multistep DPM-solver scheduler
 */
class TVMDPMSolverMultistepScheduler {
  constructor(schedulerConsts, latentShape, tvm, device, vm) {
    this.timestep = [];
    this.alpha = [];
    this.sigma = [];
    this.c0 = [];
    this.c1 = [];
    this.c2 = [];
    this.lastModelOutput = undefined;
    this.convertModelOutputFunc = undefined;
    this.stepFunc = undefined;
    this.tvm = tvm;

    // prebuild constants
    // principle: always detach for class members
    // to avoid recycling output scope.
    function loadConsts(output, dtype, input) {
      for (let t = 0; t < input.length; ++t) {
        output.push(
          tvm.detachFromCurrentScope(
            tvm.empty([], dtype, device).copyFrom([input[t]])
          )
        );
      }
    }
    loadConsts(this.timestep, "int32", schedulerConsts["timesteps"]);
    loadConsts(this.alpha, "float32", schedulerConsts["alpha"]);
    loadConsts(this.sigma, "float32", schedulerConsts["sigma"]);
    loadConsts(this.c0, "float32", schedulerConsts["c0"]);
    loadConsts(this.c1, "float32", schedulerConsts["c1"]);
    loadConsts(this.c2, "float32", schedulerConsts["c2"]);

    this.lastModelOutput = this.tvm.detachFromCurrentScope(
      this.tvm.empty(latentShape, "float32", device)
    )
    this.convertModelOutputFunc = tvm.detachFromCurrentScope(
      vm.getFunction("dpm_solver_multistep_scheduler_convert_model_output")
    )
    this.stepFunc = tvm.detachFromCurrentScope(
      vm.getFunction("dpm_solver_multistep_scheduler_step")
    )
  }

  dispose() {
	  //console.log("diffusion_worker: in dispose A");
	  if(this.logger){
	  	this.logger("diffusion_worker: in dispose A");
	  }
    for (let t = 0; t < this.timestep.length; ++t) {
      this.timestep[t].dispose();
      this.alpha[t].dispose();
      this.sigma[t].dispose();
      this.c0[t].dispose();
      this.c1[t].dispose();
      this.c2[t].dispose();
    }

    this.lastModelOutput.dispose();
    this.convertModelOutputFunc.dispose();
    this.stepFunc.dispose();
  }

  step(modelOutput, sample, counter) {
    modelOutput = this.convertModelOutputFunc(sample, modelOutput, this.alpha[counter], this.sigma[counter])
    const prevLatents = this.stepFunc(
      sample,
      modelOutput,
      this.lastModelOutput,
      this.c0[counter],
      this.c1[counter],
      this.c2[counter],
    );
    this.lastModelOutput = this.tvm.detachFromCurrentScope(
      modelOutput
    );

    return prevLatents;
  }
}

class StableDiffusionPipeline {
  constructor(tvm, tokenizer, schedulerConsts, cacheMetadata) {
    if (cacheMetadata == undefined) {
      throw Error("Expect cacheMetadata");
    }
    this.tvm = tvm;
    this.tokenizer = tokenizer;
    this.maxTokenLength = 77;

    this.device = this.tvm.webgpu();
	
    //this.tvm.bindCanvas(document.getElementById("canvas"));
	this.tvm.bindCanvas(self.canvas);
    // VM functions
    this.vm = this.tvm.detachFromCurrentScope(
      this.tvm.createVirtualMachine(this.device)
    );

    this.schedulerConsts = schedulerConsts;
    this.clipToTextEmbeddings = this.tvm.detachFromCurrentScope(
      this.vm.getFunction("clip")
    );
    this.clipParams = this.tvm.detachFromCurrentScope(
      this.tvm.getParamsFromCache("clip", cacheMetadata.clipParamSize)
    );
    this.unetLatentsToNoisePred = this.tvm.detachFromCurrentScope(
      this.vm.getFunction("unet")
    );
    this.unetParams = this.tvm.detachFromCurrentScope(
      this.tvm.getParamsFromCache("unet", cacheMetadata.unetParamSize)
    );
    this.vaeToImage = this.tvm.detachFromCurrentScope(
      this.vm.getFunction("vae")
    );
    this.vaeParams = this.tvm.detachFromCurrentScope(
      this.tvm.getParamsFromCache("vae", cacheMetadata.vaeParamSize)
    );
    this.imageToRGBA = this.tvm.detachFromCurrentScope(
      this.vm.getFunction("image_to_rgba")
    );
    this.concatEmbeddings = this.tvm.detachFromCurrentScope(
      this.vm.getFunction("concat_embeddings")
    );
  }

  dispose() {
	  //console.log("diffusion_worker: in dispose");
	  if(this.logger){
	  	this.logger("diffusion_worker: in dispose");
	  }
    // note: tvm instance is not owned by this class
    this.concatEmbeddings.dispose();
    this.imageToRGBA.dispose()
    this.vaeParams.dispose();
    this.vaeToImage.dispose();
    this.unetParams.dispose();
    this.unetLatentsToNoisePred.dispose();
    this.clipParams.dispose();
    this.clipToTextEmbeddings.dispose();
    this.vm.dispose();
  }

  /**
   * Tokenize the prompt to TVMNDArray.
   * @param prompt Input prompt
   * @returns The text id NDArray.
   */
  tokenize(prompt) {
    const encoded = this.tokenizer.encode(prompt, true).input_ids;
    const inputIDs = new Int32Array(this.maxTokenLength);

    if (encoded.length < this.maxTokenLength) {
      inputIDs.set(encoded);
      const lastTok = encoded[encoded.length - 1];
      inputIDs.fill(lastTok, encoded.length, inputIDs.length);
    } else {
      inputIDs.set(encoded.slice(0, this.maxTokenLength));
    }
    return this.tvm.empty([1, this.maxTokenLength], "int32", this.device).copyFrom(inputIDs);
  }

  /**
   * async preload webgpu pipelines when possible.
   */
  async asyncLoadWebGPUPiplines() {
    await this.tvm.asyncLoadWebGPUPiplines(this.vm.getInternalModule());
  }

  /**
   * Run generation pipeline.
   *
   * @param prompt Input prompt.
   * @param negPrompt Input negative prompt.
   * @param progressCallback Callback to check progress.
   * @param schedulerId The integer ID of the scheduler to use.
   * - 0 for multi-step DPM solver,
   * - 1 for PNDM solver.
   * @param vaeCycle optionally draw VAE result every cycle iterations.
   * @param beginRenderVae Begin rendering VAE after skipping these warmup runs.
   */
  async generate(
    prompt,
    negPrompt = "",
    progressCallback = undefined,
    schedulerId = 0,
    vaeCycle = 2, // Can be -1 (off) or 2 (show intermediary image generation steps)
    beginRenderVae = 4 // was 10
  ) {
    // Principle: beginScope/endScope in synchronized blocks,
    // this helps to recycle intermediate memories
    // detach states that needs to go across async boundaries.
    //--------------------------
    // Stage 0: CLIP
    //--------------------------
	
	self.interrupted = false;
	
    this.tvm.beginScope();
    // get latents
    const latentShape = [1, 4, 64, 64];
	//image_ready = false;

    var unetNumSteps;
    if (schedulerId == 0) {
      scheduler = new TVMDPMSolverMultistepScheduler(
        this.schedulerConsts[0], latentShape, this.tvm, this.device, this.vm);
      unetNumSteps = this.schedulerConsts[0]["num_steps"];
    } else {
      scheduler = new TVMPNDMScheduler(
        this.schedulerConsts[1], latentShape, this.tvm, this.device, this.vm);
      unetNumSteps = this.schedulerConsts[1]["num_steps"];
    }
    const totalNumSteps = unetNumSteps + 2;

    if (progressCallback !== undefined) {
      progressCallback("clip", 0, 1, totalNumSteps);
    }

    const embeddings = this.tvm.withNewScope(() => {
      let posInputIDs = this.tokenize(prompt);
      let negInputIDs = this.tokenize(negPrompt);
      const posEmbeddings = this.clipToTextEmbeddings(
        posInputIDs, this.clipParams);
      const negEmbeddings = this.clipToTextEmbeddings(
        negInputIDs, this.clipParams);
      // maintain new latents
      return this.tvm.detachFromCurrentScope(
        this.concatEmbeddings(negEmbeddings, posEmbeddings)
      );
    });
    // use uniform distribution with same variance as normal(0, 1)
    const scale = Math.sqrt(12) / 2;
    let latents = this.tvm.detachFromCurrentScope(
      this.tvm.uniform(latentShape, -scale, scale, this.tvm.webgpu())
    );
    this.tvm.endScope();
    //---------------------------
    // Stage 1: UNet + Scheduler
    //---------------------------
	vaeCycle = 2;
    if (vaeCycle != -1) {
      // show first frame
      this.tvm.withNewScope(() => {
        const image = this.vaeToImage(latents, this.vaeParams);
        this.tvm.showImage(this.imageToRGBA(image));
		self.canvas.convertToBlob() // default is PNG
		.then((blob) => {
	    	self.postMessage({
				task: my_task,
	        	status: "preview_image",
				blob:blob
	    	});
			//reset();
		})
		.catch((err) => {
			console.error("offscreenCanvas -> convert preview image to blob -> caught error: ", err);
	    	self.postMessage({
				task: my_task,
	        	status: "preview-convert-to-blob-failed",
	    	});
		});
      });
      await this.device.sync();
    }
    vaeCycle = vaeCycle == -1 ? unetNumSteps : vaeCycle;
	vaeCycle = 4;
    let lastSync = undefined;

    for (let counter = 0; counter < unetNumSteps; ++counter) {
		if(self.interrupted){
			self.interrupted = false;
			break
		}
      if (progressCallback !== undefined) {
        progressCallback("unet", counter, unetNumSteps, totalNumSteps);
      }
      const timestep = scheduler.timestep[counter];
      // recycle noisePred, track latents manually
      const newLatents = this.tvm.withNewScope(() => {
        this.tvm.attachToCurrentScope(latents);
        const noisePred = this.unetLatentsToNoisePred(
          latents, timestep, embeddings, this.unetParams);
        // maintain new latents
        return this.tvm.detachFromCurrentScope(
          scheduler.step(noisePred, latents, counter)
        );
      });
      latents = newLatents;
      // use skip one sync, although likely not as useful.
      if (lastSync !== undefined) {
        await lastSync;
      }
      // async event checker
      lastSync = this.device.sync();
	  
	  //console.log("diffusion_worker: vaeCycle: ", vaeCycle);
	  //console.log("diffusion_worker: vaeCycle: counter + 1: ", counter + 1);
	  //console.log("diffusion_worker: vaeCycle: modulo: ", (counter + 1) % vaeCycle);
	  //console.log("diffusion_worker: vaeCycle: unetNumSteps: ", unetNumSteps);
	  //console.log("diffusion_worker: vaeCycle: beginRenderVae: ", beginRenderVae);
      // Optionally, we can draw intermediate result of VAE.
      if ((counter + 1) % vaeCycle == 0 &&
        (counter + 1) != unetNumSteps &&
        counter >= beginRenderVae) {
        this.tvm.withNewScope(() => {
          const image = this.vaeToImage(latents, this.vaeParams);
          this.tvm.showImage(this.imageToRGBA(image));
		 
		  try{
			  /*
			  const blobby = await self.canvas.convertToBlob();
	    	  self.postMessage({
				task: my_task,
	        	status: "preview_image",
				blob:blobby
	    	  });
			  */
		  }
		  catch(err){
			  console.error("diffusion create preview image error: ", err);
		  }
		  
		  
		self.canvas.convertToBlob() // default is PNG
		.then((blob) => {
	    	self.postMessage({
				task: my_task,
	        	status: "preview_image",
				blob:blob
	    	});
			//reset();
		})
		.catch((err) => {
			console.error("diffusion_worker: offscreenCanvas -> convert preview image to blob -> caught error: ", err);
	    	self.postMessage({
				task: my_task,
	        	status: "preview-convert-to-blob-failed",
	    	});
		});
		  
		  
        });
        await this.device.sync();
      }
    }
    scheduler.dispose();
    embeddings.dispose();
    //-----------------------------
    // Stage 2: VAE and draw image
    //-----------------------------
    if (progressCallback !== undefined) {
      progressCallback("vae", 0, 1, totalNumSteps);
    }
    this.tvm.withNewScope(() => {
      const image = this.vaeToImage(latents, this.vaeParams);
      this.tvm.showImage(this.imageToRGBA(image));
	  
	self.canvas.convertToBlob() // default is PNG
	.then((blob) => {
    	self.postMessage({
			task: my_task,
        	status: "final_image",
			blob:blob
    	});
		//reset();
	})
	.catch((err) => {
		console.error("diffusion_worker: offscreenCanvas -> convert final image to blob -> caught error: ", err);
    	self.postMessage({
			task: my_task,
        	status: "final-convert-to-blob-failed",
    	});
	});
	  
    });
    latents.dispose();
    await this.device.sync();
    if (progressCallback !== undefined) {
      progressCallback("vae", 1, 1, totalNumSteps);
	  //console.log("diffusion_worker: image complete now?");
    }
  }

  clearCanvas() {
	  //console.log("diffusion_worker: in clearCanvas");
    this.tvm.clearCanvas();
  }
};

/**
 * A instance that can be used to facilitate deployment.
 */
class StableDiffusionInstance {
  constructor() {
    this.tvm = undefined;
    this.pipeline = undefined;
    this.config = undefined;
    this.generateInProgress = false;
    this.logger = console.log;
  }
  /**
   * Initialize TVM
   * @param wasmUrl URL to wasm source.
   * @param cacheUrl URL to NDArray cache.
   * @param logger Custom logger.
   */
  async #asyncInitTVM(wasmUrl, cacheUrl) {
    if (this.tvm !== undefined) {
      return;
    }

	this.logger = console.log;
	/*
    if (document.getElementById("log") !== undefined) {
      this.logger = function (message) {
        //console.log(message);
        const d = document.createElement("div");
        d.innerHTML = message;
        //document.getElementById("log").appendChild(d);
      };
    }
	*/

    const wasmSource = await (
      await fetch(wasmUrl)
    ).arrayBuffer();
    const tvm = await tvmjs.instantiate(
      new Uint8Array(wasmSource),
      new EmccWASI(),
      this.logger
    );
    // initialize WebGPU
    try {
      const output = await tvmjs.detectGPUDevice();
      if (output !== undefined) {
        var label = "WebGPU";
        if (output.adapterInfo.description.length != 0) {
          label += " - " + output.adapterInfo.description;
        } else {
          label += " - " + output.adapterInfo.vendor;
        }
        //document.getElementById("gpu-tracker-label").innerHTML = ("Initialize GPU device: " + label);
        tvm.initWebGPU(output.device);
      } else {
        //document.getElementById("gpu-tracker-label").innerHTML = "This browser env do not support WebGPU";
        this.reset();
        throw Error("This browser env does not support WebGPU");
      }
    } catch (err) {
		//document.getElementById("gpu-tracker-label").innerHTML = ("Find an error initializing the WebGPU device " + err.toString());
		console.error("diffusion_worker: Found an error initializing the WebGPU device " + err.toString());
		//console.log("diffusion_worker:  err.stack: ", err.stack);
		this.reset();
		throw Error("Found an error initializing WebGPU: " + err.toString());
    }

    this.tvm = tvm;
    function initProgressCallback(report) {
		//console.log("DIFFUSION PROGRESS: ", report.text, report.progress * 100);
		
	    self.postMessage({
			task: my_task,
	        status: "init_progress",
			text:report.text,
			progress:report.progress
	        //task: "automatic-speech-recognition",
	        //transcript: transcript,
	    });
		
		//document.getElementById("progress-tracker-label").innerHTML = report.text;
		//document.getElementById("progress-tracker-progress").value = report.progress * 100;
    }
    tvm.registerInitProgressCallback(initProgressCallback);
    if (!cacheUrl.startsWith("http")) {
		//console.log("diffusion_worker: cache_url did not start with http: ", cacheUrl);
		//cacheUrl = new URL(cacheUrl, document.URL).href;
		cacheUrl = new URL(cacheUrl, cache_base_url).href;
		//console.log("diffusion_worker: cache_url has been changed to absolute path: ", cacheUrl);
    }
    await tvm.fetchNDArrayCache(cacheUrl, tvm.webgpu());
  }

  /**
   * Initialize the pipeline
   *
   * @param schedulerConstUrl The scheduler constant.
   * @param tokenizerName The name of the tokenizer.
   */
  async #asyncInitPipeline(schedulerConstUrl, tokenizerName) {
    if (this.tvm == undefined) {
      throw Error("asyncInitTVM is not called");
    }
    if (this.pipeline !== undefined) return;
    var schedulerConst = []
    for (let i = 0; i < schedulerConstUrl.length; ++i) {
      schedulerConst.push(await (await fetch(schedulerConstUrl[i])).json())
    }
    const tokenizer = await tvmjsGlobalEnv.getTokenizer(tokenizerName);
    this.pipeline = this.tvm.withNewScope(() => {
      return new StableDiffusionPipeline(this.tvm, tokenizer, schedulerConst, this.tvm.cacheMetadata);
    });
    await this.pipeline.asyncLoadWebGPUPiplines();
	//console.log("diffusion_worker: diffusion pipeline loaded?");
  }

  /**
   * Async initialize config
   */
  async #asyncInitConfig() {
    if (this.config !== undefined) return;
    this.config = await (await fetch("stable-diffusion-config.json")).json();
	//console.log("this.config: config is now: ", this.config);
  }

  /**
   * Function to create progress callback tracker.
   * @returns A progress callback tracker.
   */
  #getProgressCallback() {
	  //console.log("diffusion_worker: in #getProgressCallback");
    const tstart = performance.now();
    function progressCallback(stage, counter, numSteps, totalNumSteps) {
      const timeElapsed = (performance.now() - tstart) / 1000;
      let text = "Generating ... at stage " + stage;
      if (stage == "unet") {
        counter += 1;
        text += " step [" + counter + "/" + numSteps + "]"
      }
      if (stage == "vae") {
        counter = totalNumSteps;
		try{
			//console.log("self.canvas: ", self.canvas);
			/*
			self.canvas.convertToBlob({
			  type: "image/jpeg",
			  quality: 0.95
			})
			
			self.canvas.convertToBlob({
			  type: "image/png"
			})
			*/
			//if(image_ready){
				/*
				self.canvas.convertToBlob() // default is PNG
				.then((blob) => {
			    	self.postMessage({
						task: my_task,
			        	status: "image",
						blob:blob
			    	});
					//reset();
				})
				.catch((err) => {
					console.error("offscreenCanvas -> convert to blob -> caught error: ", err);
			    	self.postMessage({
						task: my_task,
			        	status: "convert-to-blob-failed",
			    	});
				});
				*/
			//}
			//else{
			//	//console.log("in VAE phase, but image_ready is false");
			//}
			
			/*
			const blob_image = self.canvas.convertToBlob({
			  type: "image/jpeg",
			  quality: 0.95
			});
			*/
	    	
			/*
			self.canvas.toBlob().then(function(blob) {
				//console.log("diffusion_worker: blob from canvas: ", blob);
				
		    	
			});
			*/
			
		}
		catch(e){
			console.error("diffusion worker: error getting data from self.canvas: ", e);
		}
		
		
      }
      text += ", " + Math.ceil(timeElapsed) + " secs elapsed.";
	  //console.log("DIFFUSION PROGRESS: ", text, (counter / totalNumSteps) * 100);
	  
    	self.postMessage({
			task: my_task,
        	status: "progress",
			text:text,
			progress:(counter / totalNumSteps)
    	});
	  
      //document.getElementById("progress-tracker-label").innerHTML = text;
      //document.getElementById("progress-tracker-progress").value = (counter / totalNumSteps) * 100;
    }
    return progressCallback;
  }

  /**
   * Async initialize instance.
   */
  async asyncInit() {
    if (this.pipeline !== undefined) return;
    await this.#asyncInitConfig();
    await this.#asyncInitTVM(this.config.wasmUrl, this.config.cacheUrl);
    await this.#asyncInitPipeline(this.config.schedulerConstUrl, this.config.tokenizer);
  }

  /**
   * Async initialize
   *
   * @param tvm The tvm instance.
   */
  async asyncInitOnRPCServerLoad(tvmInstance) {
    if (this.tvm !== undefined) {
      throw Error("Cannot reuse a loaded instance for rpc");
    }
    this.tvm = tvmInstance;

    this.tvm.beginScope();
    this.tvm.registerAsyncServerFunc("generate", async (prompt, schedulerId, vaeCycle) => {
      //document.getElementById("inputPrompt").value = prompt;
      const negPrompt = "";
      //document.getElementById("negativePrompt").value = "";
      await this.pipeline.generate(prompt, negPrompt, this.#getProgressCallback(), schedulerId, vaeCycle);
    });
    this.tvm.registerAsyncServerFunc("clearCanvas", async () => {
      this.tvm.clearCanvas();
    });
    this.tvm.registerAsyncServerFunc("showImage", async (data) => {
      this.tvm.showImage(data);
    });
    this.tvm.endScope();
  }

  /**
   * Run generate
   */
  async generate(prompt='A photo of an astronaut riding a horse on mars',negPrompt='',schedulerId=0,vaeCycle=-1) {
	  //console.log("in diffusion_worker generate. prompt: ", prompt);
    if (this.requestInProgress) {
      this.logger("Request in progress, generate request ignored");
      return;
    }
	try {
		//this.tvm.clearCanvas();
	} catch (err) {
		console.error("diffusion_worker: generate: caught error clearing canvas first");
	}
    this.requestInProgress = true;
    try {
		await this.asyncInit();
        //const prompt = document.getElementById("inputPrompt").value;
        //const negPrompt = document.getElementById("negativePrompt").value;
        //const schedulerId = document.getElementById("schedulerId").value;
        //const vaeCycle = document.getElementById("vaeCycle").value;
	  	await this.pipeline.generate(prompt, negPrompt, this.#getProgressCallback(), schedulerId, vaeCycle);
		//console.log("image generated?");
		//image_ready = true;
    } catch (err) {
		this.logger("Generate error, " + err.toString());
		//console.log(err.stack);
	    self.postMessage({
	        status: "error",
			message: "diffusion worker: caught error: " + err.toString()
	    });
		if(self.interrupted == false){
			this.reset();
		}
		
    }
    this.requestInProgress = false;
  }

  /**
   * Reset the instance;
   */
  reset() {
	  //console.log("diffusion_worker: in reset");
	  if(this.logger){
	  	this.logger("diffusion_worker: instance is being reset");
	  }
	  
    this.tvm = undefined;
    if (this.pipeline !== undefined) {
      this.pipeline.dispose();
    }
    this.pipeline = undefined;
  }
}


try{
	//console.log("stable_diffusion.js:  hello there!");

	self.localStableDiffusionInst = new StableDiffusionInstance();
	//console.log("localStableDiffusionInst: ", self.localStableDiffusionInst);


	tvmjsGlobalEnv.asyncOnGenerate = async function (prompt, negPrompt, schedulerId, vaeCycle) {
		//console.log("diffusion worker: tvmjsGlobalEnv.asyncOnGenerate called with prompt: ", prompt);
		//console.log("-> diffusion worker: now calling localStableDiffusionInst.generate");
		await self.localStableDiffusionInst.generate(prompt, negPrompt, schedulerId, vaeCycle);
	};

	tvmjsGlobalEnv.asyncOnRPCServerLoad = async function (tvm) {
		//console.log("diffusion worker: RPC server load happened");
		const inst = new StableDiffusionInstance();
		await inst.asyncInitOnRPCServerLoad(tvm);
	};
	
}
catch(e){
	console.error("diffusion worker: ERROR setting up functions on tvmjsGlobalEnv object: ", e);
}
