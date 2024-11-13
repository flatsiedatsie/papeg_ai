const en_privacy_policy_doc = `**PRIVACY POLICY**

*Papeg.ai does not collect any personal data whatsoever*. 

The goal of this project is to show how a combination of privacy protection and ease-of-use can be achieved through privacy design.

However, there are some nuances you should be aware of.

The AI models are very big, and luckily I don't have to host them myself. That would be very expensive. Instead, they are downloaded from other websites that kindly provide this service "for free". When your browser downloads these models you will (for hopefully obvious reasons) share your IP address with those third parties. You can look up the privacy policies of those providers to find out what they could do with that information. But ironically, if you visit their websites you may be sharing much more data with them.

The download providers are:


1. www.HuggingFace.co

This company will provide the bulk of large downloads. They have a subscription businessmodel where their free downloads are subsidized by the paying users. If you are into AI or want to host large AI models, check them out.

2. www.Github.com

This Microsoft-owned company provides some smaller downloads for things like the document scanner AI.

3. www.JSDelivir.net

This hosts a file needed for image, audio and voice AI's.


Good news: generally you will only need to download these files once, and after that they will remain 'cached' in your browser, meaning they will be stored on your device. Papeg.ai is so good at this caching that you can even turn off your WiFi after you have loaded the website and the models you need. And then even reload the site, and it will magically still be available. In other words: even your downloads from Papeg.ai are cached as much as possible, which means you will be connecting to Papeg.ai very little too.

Not that that matters, since as mentioned: Papeg.ai does not collect any personal information. There is only a super basic visitor counter.

Your documents are similarly stored in your own browser's cache. So note that if you clear your browser cache, your Papeg.ai documents, settings and downloaded models will also be cleared.

`

const nl_privacy_policy_doc = `PRIVACY POLICY

**Papeg.ai verzamelt geen persoonlijke informatie**. Het doel van dit project is namelijk om te zien hoeveel privacy bescherming gegeven kan worden zonder gebruiksgemak op te geven. Papeg.ai is een sterk staaltje cutting-edge privacy design, al zeg ik het zelf.

Er zijn echter wel een paar nuances.

De AI modellen die de website download zijn nogal fors, en gelukkig hoef ik die niet zelf ergens te hosten. Dat zou hartstikke duur zijn. In plaats daarvan worden deze bestanden gedownload van de websites van enkele derde partijen die deze diensten "gratis" aanbieden. Wanneer je deze AI modellen download zul je per definitie je IP adres met deze partijen delen. Je kunt de privacy policies van deze bedrijven opzoeken als je dat wilt. Ironisch genoeg zul je waarschijnlijk meer informatie met deze partijen delen door hun website te bezoeken.

De downloads komen van:

1. www.HuggingFace.co

Dit bedrijf zal de meerderheid van de grote downloads verzorgen. Ze hebben een abonnementsvorm als businessmodel, en de betalende klanten subsidieeren de 'gratis' downloads. Als je AI interessant vindt of zelf AI modellen wil hosten, dan is dit een toffe partij.

2. www.Github.com

Dit door Microsoft overgenomen bedrijf biedt downloads voor enkele kleinere modellen, zoals de document scanner.

3. www.JSDelivir.net

Dit bedrijf biedt bestanden aan die worden gebruikt bij audio, afbeelding en stembediening AI's.

Goed nieuws: over het algemeen zul je deze bestanden slechts éénmalig hoeven downloaden. Je browser zal ze vervolgens bewaren voor je volgende bezoek. Papeg.ai is zo goed in dit 'cachen' dat de website zelf ook volledig op je eigen apparaat wordt opgeslagen. Je kunt, als de gewenste AI's eenmaal gedownload zijn, gerust je WiFi uitzetten. Sterker nog, je kunt vervolgens zelfs de website verversen, en die zal dan alsnog weer verschijnen. Met andere woorden: je zult ook met Papeg.ai zelf zo min mogelijk verbinding leggen.

Niet dat dat veel uitmaakt, want zoals gezegd: Papeg.ai verzamelt geen persoonlijke informatie.

Je documenten worden ook allemaal lokaal, in de cache van je browser, opgeslagen. Let op: als je je browser cache wist zullen ook al je Papeg.ai documenten (en de AI modellen en alle instellingen) worden gewist.


`


function create_privacy_policy_document(){
	console.log("in create_privacy_policy_document");
	
	if(window.settings.language == 'nl'){
		really_create_file(false,nl_privacy_policy_doc,'privacy_policy.txt')
		.then((value) => {
			localStorage.setItem(folder + '_last_opened', 'privacy_policy.txt');
			console.log("create_privacy_policy_document: really_create_file:  done.  value: ", value);
			update_ui();
		})
		.catch((err) => {
			console.error("create_privacy_policy_document: really_create_file: Error creating new file.  err: ", err);
			update_ui();
		})
		
	}
	else{
		really_create_file(false,en_privacy_policy_doc,'privacy_policy.txt')
		.then((value) => {
			localStorage.setItem(folder + '_last_opened', 'privacy_policy.txt');
			console.log("create_privacy_policy_document: really_create_file:  done.  value: ", value);
			update_ui();
		})
		.catch((err) => {
			console.error("create_privacy_policy_document: really_create_file: Error creating new file.  err: ", err);
			update_ui();
		})
	}
		
}
console.log("privacy_policy special has loaded in");

