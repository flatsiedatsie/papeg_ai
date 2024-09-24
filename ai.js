
window.assistants = {
	
	"developer":{
		"name":"Papegai",
		"description":"",
		"icon":"",
		"homepage_url":"https://www.tijmenschep.com",
		"do_not_load":true
	},
	
	
	"translator":{
		"name":"Translator", 
		"real_name":"Opus-MT, MBart, M2M100",
		"description":"",
		"icon":"",
		"model_file_name":"opus-mt",
		"runner":"transformers_js",
		"homepage_url":"https://blogs.helsinki.fi/language-technology/",
		"license":"CC BY 4.0",
		"license_url":"https://creativecommons.org/licenses/by/4.0/deed.en",
		"initial_example_prompt":{
			"en":"I like to take long walks by the ocean",
			"nl":"Ik maak graag strandwandelingen"
		},
		"examples":{
			'en':[
				{"title":"Long walks","prompt":"I like to take long walks by the ocean","action":"prompt"},
				{"title":"Prairie","prompt":"To make a prairie it takes a clover and one bee,\nOne clover, and a bee.\nAnd revery.\nThe revery alone will do,\nIf bees are few.\n\n- Emily Dickinson","action":"prompt"},
			],
			'nl':[
				{"title":"Strandwandeling","prompt":"Ik maak graag strandwandelingen","action":"prompt"},
				{"title":"Prairie","prompt":"To make a prairie it takes a clover and one bee,\nOne clover, and a bee.\nAnd revery.\nThe revery alone will do,\nIf bees are few.\n\n- Emily Dickinson","action":"prompt"},
			]
		},
		"do_not_load":true,
		"type":"translation",
		"media":["text2text","special"],
		"memory":1.5,
	},
	
	
	"scribe":{
		"name":"Scribe",
		"real_name":"Whisper",
		"description":"",
		"icon":"",
		"model_file_name":"/whisper-",
		"runner":"transformers_js",
		"license":"MIT",
		"license_url":"https://github.com/openai/whisper/blob/main/LICENSE",
		"homepage_url":"https://openai.com/research/whisper",
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"do_not_load":true,
		"type":"listener",
		"media":["audio","special"],
		"memory":0.6,
		"size":0.3,
	},
	
	
	"speaker":{
		"name":"Speaker",
		"real_name":"T5",
		"description":"",
		"icon":"",
		"model_file_name":"speecht5_",
		"runner":"transformers_js",
		"homepage_url":"",
		"initial_example_prompt":{
			"en":"I can turn any sentence or document that you provide into speech.",
			"nl":"Hello World"
		},
		"examples":{
			'en':[	{"title":"Say 'Hello World'","prompt":"Hello World","action":"prompt"},{"title":"Shakespeare","prompt":"Bravo!","function":"load_blueprint_voice_conversation_example"} ],
			'nl':[	{"title":"Zeg 'Hallo wereld'","prompt":"Hallo Wereld","action":"prompt"},{"title":"Shakespeare","prompt":"Bravo!","function":"load_blueprint_voice_conversation_example"} ]
		},
		"do_not_load":true,
		"type":"tts",
		"media":["audio","special"],
		"memory":0.5,
		"size":0.5,
		
	},
	
	
	"musicgen":{
		"name":"Musician",
		"real_name":"MusicGen",
		"description":"",
		"icon":"",
		//"model_file_name":"musicgen-small/resolve/main/onnx/decoder_model_merged_quantized.onnx",
		"model_file_name":"musicgen-small",
		"runner":"transformers_js",
		"license":"CC BY NC 4.0",
		"license_url": "https://duckduckgo.com/?q=cc+by+nc+4.0",
		"homepage_url":"https://huggingface.co/facebook/musicgen-small",
		"initial_example_prompt":{
			"en":"80s pop track with bassy drums and synth",
			"nl":"80's pop nummer in de stijl van Miama Vice, met donkere bass en drums, en een synthesizer"
		},
		"examples":{
			'en':[
				{"title":"80's synth","prompt":"80s pop track with bassy drums and synth","action":"prompt"},
				{"title":"EDM","prompt":"a light and cheerly EDM track, with syncopated drums, aery pads, and strong emotions bpm: 130","action":"prompt"},
				{"title":"Country","prompt":"A cheerful country song with acoustic guitars","action":"prompt"},
				{"title":"Chill","prompt":"lofi slow bpm electro chill with organic samples","action":"prompt"},
				
			],
			'nl':[
				{"title":"80's","prompt":"80s pop track with bassy drums and synth","action":"prompt"},
				{"title":"Relaxed","prompt":"lofi slow bpm electro chill with organic samples","action":"prompt"},
			]
		},
		"do_not_load":true,
		"type":"music-generation",
		"media":["audio","special"],
		"size":0.7,
		"memory":5.5,
		"temperature":1,
		
	},
	
	
	
	
	
	
	"text_to_image":{
		"name":"Text to image",
		"real_name":"Stable Diffusion",
		"description":"",
		"icon":"",
		"license":"Open RAIL-M",
		"license_url":"https://huggingface.co/stabilityai/stable-diffusion-2/blob/main/LICENSE-MODEL", // https://github.com/CompVis/stable-diffusion/blob/main/LICENSE
		"homepage_url":"https://stability.ai/",
		"initial_example_prompt":{
			"en":"A painting of hot air balloons flying over a small French town, in the style of Vincent van Gogh's Starry Night.",
			"nl":"Een schilderij van heteluchtbalonnen die boven een klein frans dorpje zweven, in de stijl van Vincent van Gogh's Sterrennacht."
		},
		"examples":{
			'en':[
				{"title":"Astronaut","prompt":"High-quality digital art, ultra-detailed, professional, clear, high contrast, high saturation, vivid deep blacks, crystal clear, ((rocket man in space)), wearing a full helmet and leather jacket, leather gloves, standing in front of an advanced high-tech space rocket, surrounded by the vastness of outer space, with intense, vibrant colors, colorful, dark, modern art style, the rocket illuminated by the cosmic light, the rocketman standing solo against the cosmic backdrop, bokeh effect creating a blurry background, photography-style composition, on eye level, masterpiece.","action":"prompt"},
				{"title":"Van Gogh","prompt":"A painting of hot air balloons flying over a small French town, in the style of Vincent van Gogh's Starry Night.","action":"prompt"},
				{"title":"Paris","prompt":"autumn in paris, ornate, beautiful, atmosphere, vibe, mist, smoke, fire, chimney, rain, wet, pristine, puddles, melting, dripping, snow, creek, lush, ice, bridge, forest, roses, flowers, by Stanley Artgerm Lau, Greg Rutkowski, Thomas Kinkade, Alphonse Mucha, Loish, Norman Rockwell","action":"prompt"},
				{"title":"B.A.","prompt":"B.A. Baracus, gold chains, mohawk, muscles, in the style of Vincent van Gogh's Sunflowers","action":"prompt"},
			],
			'nl':[
				{"title":"Astronaut","prompt":"Een foto van een astronaut die op een paard rijdt","action":"prompt"},
				{"title":"Van Gogh","prompt":"Een schilderij van heteluchtbalonnen die boven een klein frans dorpje zweven, in de stijl van Vincent van Gogh's Sterrennacht","action":"prompt"},
				{"title":"Parijs","prompt":"herfst in Parijs, rijk, schoonheid, atmosfeer, stemmig, mist, rook, vuur, schoorsteen, regen, nat, perfect, waterplassen, smelten, druppelen, sneeuw, kreek, ornaat, ijs, brug, bos, rozen, bloemen, door Stanley Artgerm Lau, Greg Rutkowski, Thomas Kinkade, Alphonse Mucha, Loish, Norman Rockwell","action":"prompt"}
			]
		},
		"do_not_load":true,
		"show_if_web_gpu":true,
		"type":"text_to_image",
		"runner":"transformers_js",
		"media":["image","special"], // ,'text'		
		"size":2.6,
		"memory":5.5,
		"temperature":0.7,
		"model_file_name":"clip-vit-base-patch16",
	},
	
	
	
	"imager":{
		"name":"Image maker",
		"real_name":"Diffusion2",
		"description":"",
		"icon":"",
		"license":"Open RAIL-M",
		"license_url":"https://huggingface.co/stabilityai/stable-diffusion-2/blob/main/LICENSE-MODEL", // https://github.com/CompVis/stable-diffusion/blob/main/LICENSE
		"homepage_url":"https://stability.ai/",
		"initial_example_prompt":{
			"en":"A painting of hot air balloons flying over a small French town, in the style of Vincent van Gogh's Starry Night.",
			"nl":"Een schilderij van heteluchtbalonnen die boven een klein frans dorpje zweven, in de stijl van Vincent van Gogh's Sterrennacht."
		},
		"examples":{
			'en':[
				{"title":"Astronaut","prompt":"High-quality digital art, ultra-detailed, professional, clear, high contrast, high saturation, vivid deep blacks, crystal clear, ((rocket man in space)), wearing a full helmet and leather jacket, leather gloves, standing in front of an advanced high-tech space rocket, surrounded by the vastness of outer space, with intense, vibrant colors, colorful, dark, modern art style, the rocket illuminated by the cosmic light, the rocketman standing solo against the cosmic backdrop, bokeh effect creating a blurry background, photography-style composition, on eye level, masterpiece.","action":"prompt"},
				{"title":"Van Gogh","prompt":"A painting of hot air balloons flying over a small French town, in the style of Vincent van Gogh's Starry Night.","action":"prompt"},
				{"title":"Paris","prompt":"autumn in paris, ornate, beautiful, atmosphere, vibe, mist, smoke, fire, chimney, rain, wet, pristine, puddles, melting, dripping, snow, creek, lush, ice, bridge, forest, roses, flowers, by Stanley Artgerm Lau, Greg Rutkowski, Thomas Kinkade, Alphonse Mucha, Loish, Norman Rockwell","action":"prompt"},
				{"title":"B.A.","prompt":"B.A. Baracus, gold chains, mohawk, muscles, in the style of Vincent van Gogh's Sunflowers","action":"prompt"},
			],
			'nl':[
				{"title":"Astronaut","prompt":"Een foto van een astronaut die op een paard rijdt","action":"prompt"},
				{"title":"Van Gogh","prompt":"Een schilderij van heteluchtbalonnen die boven een klein frans dorpje zweven, in de stijl van Vincent van Gogh's Sterrennacht","action":"prompt"},
				{"title":"Parijs","prompt":"herfst in Parijs, rijk, schoonheid, atmosfeer, stemmig, mist, rook, vuur, schoorsteen, regen, nat, perfect, waterplassen, smelten, druppelen, sneeuw, kreek, ornaat, ijs, brug, bos, rozen, bloemen, door Stanley Artgerm Lau, Greg Rutkowski, Thomas Kinkade, Alphonse Mucha, Loish, Norman Rockwell","action":"prompt"}
			]
		},
		"do_not_load":true,
		"show_if_web_gpu":true,
		"runner":"other",
		"languages":["en","es","de","it","fr","pt","nl"],
		"type":"text_to_image",
		"media":["image","special"],
		"size":4,
		"memory":7,
		//"runner":"imager",
		"model_file_name":"web-sd-shards-v1-5/params_shard_60.bin",
	},
	
	
	
	
	
	
	"image_to_text":{
		"name":"Image to text",
		"real_name":"Moondream2",
		"description":"",
		"icon":"",
		"license":"Apache 2",
		"license_url": "https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/vikhyatk/moondream2",
		"initial_example_prompt":{
			"en":"Describe this image in detail",
			"nl":"Beschrijf de afbeelding in detail"
		},
		"do_not_load":true,
		"show_if_web_gpu":true,
		"type":"image_to_text",
		"runner":"transformers_js",
		//"huggingface_id":"Xenova/moondream2",
		"huggingface_id":"onnx-community/Florence-2-base-ft",
		"huggingface_id_options":['onnx-community/Florence-2-base-ft','onnx-community/Florence-2-large-ft','onnx-community/Florence-2-large','Xenova/nanoLlava','Xenova/moondream2'], // 
		"media":["image","special"], // ,'text'
		"model_type":"instruct",
		"size":1.6,
		"memory":5.5,
		"temperature":1,
		//"runner":"transformers_js",
		"model_file_name":"lorence"
	},
	
	
	"image_to_text_ocr":{
		"name":"Image text scanner",
		"real_name":"Tesseract",
		"description":"",
		"icon":"",
		"license":"Apache 2",
		"license_url": "https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://tesseract.projectnaptha.com/",
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"do_not_load":true,
		"runner":"other",
		"type":"ocr",
		"media":["image","special"],
		"size":.1,
		"memory":.3,
		"temperature":1,
		"model_file_name":"tesseract",
		"pretend_cached":true,
	},
	
	
	"clone_researcher1":{
		"name":"Researcher 1",
		"real_name":"Mistral 7B",
		"clone_original":"fast_mistral",
		"description":"",
		"icon":"",
		"download_url":null,
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://mistral.ai/news/announcing-mistral-7b/",
		"type":"researcher",
		"model_type":"instruct",
		"media":["special"],
		"initial_example_prompt":{
			"en":"Find information about Husky dogs",
			"nl":"Zoek informatie over Husky honden"
		},
		"examples":{
			'en':[	{"title":"Golden Retrievers","prompt":"I want to know everything about keeping Golden Retrievers as pets","action":"prompt"}],
			'nl':[	{"title":"Golden Retrievers","prompt":"Ik wil alles weten over Golden Retrievers als huisdier houden","action":"prompt"}],
		},
		"show_if_web_gpu":true,
		"size":3.9,
		"temperature":0,
		"context_size":32768,
		"context":4096,
		"template":"none", // web_llm handles tokenization
		"runner":"web_llm",
		"web_llm_file_name":"Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
		"model_file_name":"Mistral-7B-Instruct-v0.3-q4f16_1-MLC/resolve/main/params_shard_105.bin",
		//"system_prompt":"You are a helpful assistant that always answers in the Dutch language."
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
	},
	
	
	
	"phi3_rag":{
		"name":"Bling Phi 3 mini 4k",
		"real_name":"Bling Phi 3",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/bling_phi_3_RAG_chunked/resolve/main/bling-phi-3-00001-of-00012.gguf",
		"config_url":"microsoft/Phi-3-mini-4k-instruct",
		"runner":"llama_cpp",
		"license":"MIT",
		//"show_if_web_gpu":false,
		"license_url":"https://duckduckgo.com/?q=mit+license",
		"homepage_url":"https://huggingface.co/llmware/bling-phi-3-gguf",
		"type":"rag",
		"model_type":"instruct",
		"media":["text"],
		"size":2.4,
		"temperature":0,
		"context_size":4096,
		"context":4096,
		"no_system_prompt":true,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		//"availability":"developer"
		//"system_prompt":""
	},
	
	
	
	
	
	
	
	
	
	
	// NL
	"fietje3":{
		"name":"Fietje 3",
		"real_name":"Fietje 3",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/fietje-3-mini-4k-instruct-Q4_K_M_gguf_chunked/resolve/main/fietje-3-mini-4k-instruct-Q4_K_M-00001-of-00017.gguf",
		"config_url":"microsoft/Phi-3-mini-4k-instruct",
		"model_file_name":"fietje-3-mini-4k-instruct-Q4_K_M-00017-of-00017.gguf",
		"runner":"llama_cpp",
		"license":"MIT",
		"license_url":"https://en.wikipedia.org/wiki/MIT_License",
		"homepage_url":"https://github.com/BramVanroy/fietje",
		"type":"dutch",
		"model_type":"instruct",
		"media":["text"],
		"languages":["nl"],
		"initial_example_prompt":"Wat is de hoofdstad van Marocco?",
		"examples":{
			"all":[{"title":"Rottweilers","prompt":"Wat zijn de kenmerken van Rottweilers?","action":"prompt"},{"title":"🚗🛻","prompt":"Wat zijn de 5 meest populaire soorten autos?\nGeef antwoord in de vorm van een lijst.\nGeef geen uitleg, alleen de lijst.","action":"prompt"}, {"title":"Tiananmen","prompt":"Wat is er gebeurd op het Tiananmen plein?","action":"prompt"},],
		},
		//"show_if_web_gpu":false,
		"size":2,
		"temperature":0.7,
		"context_size":4096,
		"context":2048,
		"cache_type_k":"q4_0",
		//"template":"s_INST",
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	
	// backup
	"fietje2":{
		"name":"Fietje 2",
		"real_name":"Fietje 2",
		"description":"",
		"icon":"",
		//"download_url":"/models/fietje3/fietje-3-mini-4k-instruct-Q4_K_M-00001-of-00017.gguf",
		"download_url":"https://huggingface.co/BramVanroy/fietje-2-instruct-gguf/resolve/main/Q4_K_M/fietje-2b-instruct-Q4_K_M.gguf",
		//"config_url":"BramVanroy/fietje-2-instruct",
		"config_url":"BramVanroy/fietje-2",
		"model_file_name":"fietje-2b-instruct-Q4_K_M.gguf",
		"runner":"llama_cpp",
		"license":"MIT",
		"license_url":"https://en.wikipedia.org/wiki/MIT_License",
		"homepage_url":"https://github.com/BramVanroy/fietje",
		"type":"dutch",
		"model_type":"instruct",
		"media":["text"],
		"languages":["nl"],
		"initial_example_prompt":"Wat is de hoofdstad van Marocco?",
		"examples":{
			"all":[{"title":"Rottweilers","prompt":"Wat zijn de kenmerken van Rottweilers?","action":"prompt"},{"title":"🚗🛻","prompt":"Wat zijn de 5 meest populaire soorten autos?\nGeef antwoord in de vorm van een lijst.\nGeef geen uitleg, alleen de lijst.","action":"prompt"}, {"title":"Tiananmen","prompt":"Wat is er gebeurd op het Tiananmen plein?","action":"prompt"},],
		},
		//"show_if_web_gpu":false,
		"size":1.7,
		"temperature":0.7,
		"context_size":2048,
		"context":2048,
		//"cache_type_k":"q4_0",
		//"template":"s_INST",
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		"availability":"advanced",
	},
	
	
	
	
	// SPANISH
	
	// https://huggingface.co/Bluckr/Phi-3-mini-4k-instruct-function-calling-assistant-spanish-pofi-v2/tree/main
	
	"phi3_mini_spanish":{
		"name":"Phi3 mini Spanish",
		"real_name":"Phi3 Mini 4K Pofi",
		"description":"",
		"icon":"",
		//"download_url":"/models/fietje3/fietje-3-mini-4k-instruct-Q4_K_M-00001-of-00017.gguf",
		"download_url":"https://huggingface.co/BoscoTheDog/phi_3_mini_4k_it_spanish_pofi_Q4_K_M/resolve/main/phi_3_mini_4k_it_spanish_pofi.Q4_K_M-00001-of-00025.gguf",
		//"config_url":"BramVanroy/fietje-2-instruct",
		"config_url":"Bluckr/Phi-3-mini-4k-instruct-function-calling-assistant-spanish-pofi-v2",
		"model_file_name":"phi_3_mini_4k_it_spanish_pofi.Q4_K_M-00025-of-00025.gguf",
		"runner":"llama_cpp",
		"license":"MIT",
		"license_url":"https://en.wikipedia.org/wiki/MIT_License",
		"homepage_url":"https://huggingface.co/Bluckr/Phi-3-mini-4k-instruct-function-calling-assistant-spanish-pofi-v2",
		"type":"spanish",
		"model_type":"instruct",
		"media":["text"],
		"languages":["es"],
		"initial_example_prompt":"¿Cuál es la capital de Marruecos?",
		"examples":{
			"all":[{"title":"🚗🛻","prompt":"¿Cuáles son los 5 tipos de automóviles más populares?\nResponde en forma de lista.\nNo des explicaciones, solo la lista.","action":"prompt"}, {"title":"Tiananmen","prompt":"¿Qué sucedió en la Plaza de Tiananmen?","action":"prompt"}],
		},
		//"show_if_web_gpu":false,
		"size":2.3,
		"temperature":0.7,
		"context_size":4096,
		"context":2048,
		"cache_type_k":"q4_0",
		//"template":"s_INST",
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	
	
	
	
	
	
	// Portugese
	
	// https://huggingface.co/afrideva/phi-3-portuguese-tom-cat-4k-instruct-GGUF
	
	"phi3_mini_portugese":{
		"name":"Phi3 mini Portugese",
		"real_name":"Phi3 Mini 4K Tom Cat",
		"description":"",
		"icon":"",
		//"download_url":"/models/fietje3/fietje-3-mini-4k-instruct-Q4_K_M-00001-of-00017.gguf",
		"download_url":"https://huggingface.co/BoscoTheDog/phi_3_mini_4k_it_portuguese_tom_cat_Q4_K_M_chunked/resolve/main/phi_3_mini_4k_it_portuguese_tom_cat_Q4_K_M-00001-of-00028.gguf",
		//"config_url":"BramVanroy/fietje-2-instruct",
		"config_url":"rhaymison/phi-3-portuguese-tom-cat-4k-instruct",
		"model_file_name":"phi_3_mini_4k_it_portuguese_tom_cat_Q4_K_M-00028-of-00028.gguf",
		"runner":"llama_cpp",
		"license":"MIT",
		"license_url":"https://en.wikipedia.org/wiki/MIT_License",
		"homepage_url":"https://huggingface.co/rhaymison/phi-3-portuguese-tom-cat-4k-instruct",
		"type":"portugese",
		"model_type":"instruct",
		"media":["text"],
		"languages":["pt"],
		"initial_example_prompt":"Qual é a capital de Marrocos?",
		"examples":{
			"all":[{"title":"🚗🛻","prompt":"Quais são os 5 tipos de carros mais populares? Responda sob a forma de lista. Não dê uma explicação, apenas a lista.","action":"prompt"}, {"title":"Tiananmen","prompt":"O que aconteceu na Praça da Paz Celestial?","action":"prompt"}],
		},
		//"show_if_web_gpu":false,
		"size":2.3,
		"temperature":0.7,
		"context_size":4096,
		"context":2048,
		"cache_type_k":"q4_0",
		//"template":"s_INST",
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	
	
	
	// FRENCH
	
	"phi3_mini_french":{
		"name":"Phi3 mini French",
		"real_name":"Phi3 Mini 4K Alpaca",
		"description":"",
		"icon":"",
		//"download_url":"/models/fietje3/fietje-3-mini-4k-instruct-Q4_K_M-00001-of-00017.gguf",
		"download_url":"https://huggingface.co/BoscoTheDog/phi_3_mini_4k_it_french_alpaca_v1_Q4_K_M/resolve/main/phi_3_mini_4k_it_french_alpaca_v1.Q4_K_M-00001-of-00026.gguf",
		"config_url":"BoscoTheDog/phi_3_mini_4k_it_french_alpaca_v1_Q4_K_M",
		"model_file_name":"phi_3_mini_4k_it_french_alpaca_v1.Q4_K_M-00026-of-00026.gguf",
		"runner":"llama_cpp",
		"license":"MIT",
		"license_url":"https://en.wikipedia.org/wiki/MIT_License",
		"homepage_url":"https://huggingface.co/jpacifico/French-Alpaca-Phi-3-mini-4k-instruct-v1.0-GGUF",
		"type":"french",
		"model_type":"instruct",
		"media":["text"],
		"languages":["fr"],
		"initial_example_prompt":"Quelle est la capitale du Maroc?",
		"examples":{
			"all":[{"title":"🚗🛻","prompt":"Quels sont les 5 types de voitures les plus populaires?\nRéponse sous forme de liste.\nNe donnez pas d'explication, juste la liste.","action":"prompt"}, {"title":"Tiananmen","prompt":"Que s'est-il passé sur la place Tiananmen?","action":"prompt"}],
		},
		//"show_if_web_gpu":false,
		"size":2.3,
		"temperature":0.7,
		"context_size":4096,
		"context":2048,
		"cache_type_k":"q4_0",
		//"template":"s_INST",
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	
	
	
	// ITALIAN
	
	"phi3_mini_italian":{
		"name":"Phi3 mini Italian",
		"real_name":"Phi3 Mini",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/phi_3_mini_128k_italian_v2_Q4_K_M_chunked/resolve/main/phi_3_mini_128k_italian_v2_Q4_K_M-00001-of-00029.gguf",
		"config_url":"nonsonpratico/phi3-3.8-128k-italian-v2",
		"model_file_name":"phi_3_mini_128k_italian_v2_Q4_K_M-00029-of-00029.gguf",
		"runner":"llama_cpp",
		"license":"MIT",
		"license_url":"https://en.wikipedia.org/wiki/MIT_License",
		"homepage_url":"https://huggingface.co/nonsonpratico/phi3-3.8-128k-italian-v2",
		"type":"italian",
		"model_type":"instruct",
		"media":["text"],
		"languages":["it"],
		"initial_example_prompt":"Qual è la capitale del Marocco?",
		"examples":{
			"all":[{"title":"🚗🛻","prompt":"Quali sono i 5 tipi di auto più popolari?\nRispondi sotto forma di elenco.\nNon dare una spiegazione, solo l'elenco.","action":"prompt"}, {"title":"Tiananmen","prompt":"Cosa è successo in piazza Tiananmen?","action":"prompt"}],
		},
		//"show_if_web_gpu":false,
		"size":2.3,
		"temperature":0.7,
		"context_size":131027,
		"context":2048,
		"cache_type_k":"q4_0",
		//"template":"s_INST",
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	
	// Greek
	
	// https://huggingface.co/mradermacher/GreekLlama-1.1B-it-GGUF/resolve/main/GreekLlama-1.1B-it.Q8_0.gguf
	
	"tiny_llama_greek":{
		"name":"TinyLlama Greek",
		"real_name":"GreekLlama 1.1B it", // there is also a chat version
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/mradermacher/GreekLlama-1.1B-it-GGUF/resolve/main/GreekLlama-1.1B-it.Q8_0.gguf",
		//"config_url":"https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0/resolve/main/tokenizer_config.json",
		"config_url":"gsar78/GreekLlama-1.1B-it", //"TinyLlama/TinyLlama-1.1B-Chat-v1.0",
		"model_file_name":"GreekLlama-1.1B-it.Q8_0.gguf",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/gsar78/GreekLlama-1.1B-it",
		"type":"greek",
		"languages":["gr"],
		"model_type":"instruct",
		"media":["text"],
		"initial_example_prompt":"Ποια είναι η πρωτεύουσα του Μαρόκου",
		"examples":{
			"all":[{"title":"Rottweiler","prompt":"Ποια είναι τα χαρακτηριστικά των Rottweiler;","action":"prompt"},{"title":"🚗🛻","prompt":"Ποιοι είναι οι 5 πιο δημοφιλείς τύποι αυτοκινήτων;\nΑπαντήστε με τη μορφή λίστας.\nΜην προσθέσετε εξηγήσεις, μόνο τη λίστα.","action":"prompt"}, {"title":"Tiananmen","prompt":"Τι συνέβη στην πλατεία Tiananmen;","action":"prompt"},],
		},
		"size":1.1,
		"temperature":0.7,
		"context_size":1024,
		"context":1024,
		//"template":"im_start_im_end", // web_llm handles prompt wrapping
		//"chat_template":"{% for message in messages %}\n{% if message['role'] == 'user' %}\n{{ '<|user|>\n' + message['content'] + eos_token }}\n{% elif message['role'] == 'system' %}\n{{ '<|system|>\n' + message['content'] + eos_token }}\n{% elif message['role'] == 'assistant' %}\n{{ '<|assistant|>\n'  + message['content'] + eos_token }}\n{% endif %}\n{% if loop.last and add_generation_prompt %}\n{{ '<|assistant|>' }}\n{% endif %}\n{% endfor %}",
		"penalty_alpha": 0.5,
		"top_k": 4,
		"repetition_penalty": 1.01,
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false
		//"system_prompt":"You are a helpful assistant that always answers in the Dutch language."
	},
	
	
	
	
	
	
	
	
	
	
	
	
	
	


	// GERMAN
	
	
	"german_gemma_2b":{
		"name":"Gemma 2B Sauerkraut",
		"real_name":"Gemma 2B Sauerkraut",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/gemma_2b_sauerkraut_gguf_chunked/resolve/main/sauerkrautlm-gemma-2b.Q4_0-00001-of-00004.gguf",
		"config_url":"Xenova/gemma-tokenizer",
		"model_file_name":"sauerkrautlm-gemma-2b.Q4_0-00004-of-00004.gguf",
		"runner":"llama_cpp",
		"license":"Gemma",
		"license_url":"https://ai.google.dev/gemma/terms",
		"homepage_url":"https://huggingface.co/VAGOsolutions",
		"type":"german",
		"model_type":"instruct",
		"media":["text"],
		"languages":['de'], // technically it also supports English, but there are wayyy better models for English available
		"initial_example_prompt":"Was ist die Hauptstadt von Marokko?",
		"examples":{
			'all':[{"title":"Smallest planet","prompt":"Was ist der kleinste Planet in unserem Sonnensystem?","action":"prompt"}]
		},
		"size":1.6,
		"temperature":0.7,
		"context_size":8192,
		"context":2048,
		"no_system_prompt":true,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false
	},
	

	"tiny_llama_german":{
		"name":"TinyLlama 1.1B German",
		"real_name":"TinyLlama 1.1B German", //  Chat
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/Fadikkop/TinyLlama-1.1B-Chat-v1.0-german-Q4_K_M-GGUF/resolve/main/tinyllama-1.1b-chat-v1.0-german.Q4_K_M.gguf",
		//"config_url":"https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0/resolve/main/tokenizer_config.json",
		"config_url":"TinyLlama/TinyLlama-1.1B-Chat-v1.0", //"TinyLlama/TinyLlama-1.1B-Chat-v1.0",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"",
		"type":"german",
		"languages":["de","en"],
		"model_type":"chat",
		"initial_example_prompt":"Was ist die Hauptstadt von Marokko?",
		"examples":{
			'all':[{"title":"Smallest planet","prompt":"Was ist der kleinste Planet in unserem Sonnensystem?","action":"prompt"}]
		},
		"media":["text"],
		"size":0.5,
		"temperature":0.7,
		"context_size":1024,
		"context":1024,
		//"template":"im_start_im_end", // web_llm handles prompt wrapping
		//"chat_template":"{% for message in messages %}\n{% if message['role'] == 'user' %}\n{{ '<|user|>\n' + message['content'] + eos_token }}\n{% elif message['role'] == 'system' %}\n{{ '<|system|>\n' + message['content'] + eos_token }}\n{% elif message['role'] == 'assistant' %}\n{{ '<|assistant|>\n'  + message['content'] + eos_token }}\n{% endif %}\n{% if loop.last and add_generation_prompt %}\n{{ '<|assistant|>' }}\n{% endif %}\n{% endfor %}",
		"penalty_alpha": 0.5,
		"top_k": 4,
		"repetition_penalty": 1.01,
		"model_file_name":"tinyllama-1.1b-chat-v1.0-german",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
		"availability":"advanced"
		//"system_prompt":"You are a helpful assistant that always answers in the Dutch language."
	},
	
	
	
	
	// POLISH
	
	// /https://huggingface.co/eryk-mazus/polka-1.1b-chat-gguf/resolve/main/polka-1.1b-chat-Q8_0.gguf
	
	"tiny_llama_polish":{
		"name":"TinyLlama Polish",
		"real_name":"TinyLlama 1.1B Polka", //  Chat
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/eryk-mazus/polka-1.1b-chat-gguf/resolve/main/polka-1.1b-chat-Q8_0.gguf",
		//"config_url":"https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0/resolve/main/tokenizer_config.json",
		"config_url":"TinyLlama/TinyLlama-1.1B-Chat-v1.0", //"TinyLlama/TinyLlama-1.1B-Chat-v1.0",
		"model_file_name":"polka-1.1b-chat-Q8_0.gguf",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/eryk-mazus/polka-1.1b-chat-gguf",
		"type":"polish",
		"languages":["pl"],
		"initial_example_prompt":"Jaka jest stolica Maroka?",
		"model_type":"chat",
		"media":["text"],
		"size":1.2,
		"temperature":0.7,
		"context_size":1024,
		"context":1024,
		//"template":"im_start_im_end", // web_llm handles prompt wrapping
		//"chat_template":"{% for message in messages %}\n{% if message['role'] == 'user' %}\n{{ '<|user|>\n' + message['content'] + eos_token }}\n{% elif message['role'] == 'system' %}\n{{ '<|system|>\n' + message['content'] + eos_token }}\n{% elif message['role'] == 'assistant' %}\n{{ '<|assistant|>\n'  + message['content'] + eos_token }}\n{% endif %}\n{% if loop.last and add_generation_prompt %}\n{{ '<|assistant|>' }}\n{% endif %}\n{% endfor %}",
		"penalty_alpha": 0.5,
		"top_k": 4,
		"repetition_penalty": 1.01,
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false
		//"system_prompt":"You are a helpful assistant that always answers in the Dutch language."
	},
	
	
	// UKRANIAN
	
	"ukranian":{
		"name":"Sir Ukranian",
		"real_name":"Sir Ukranian",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/Ukranian_Q2_chunked/resolve/main/sirukrainian_Q2_K-00001-of-00031.gguf",
		"config_url":"BoscoTheDog/phi_3_mini_128k_italian_v2_Q4_K_M_chunked",
		"model_file_name":"sirukrainian_Q2_K-00031-of-00031.gguf",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/RaduGabriel/SirUkrainian",
		"type":"ukranian",
		"model_type":"instruct",
		"media":["text"],
		"languages":["uk"],
		"initial_example_prompt":"Яка столиця в Марокко?",
		"examples":{
			"all":[{"title":"🚗🛻","prompt":"Які 5 найпопулярніших типів транспортних засобів?\nПовертає результат у вигляді нумерованого списку.\nНе додавайте пояснень, тільки список.","action":"prompt"}, {"title":"Tiananmen","prompt":"Що сталося на площі Тяньаньмень?","action":"prompt"}],
		},
		//"show_if_web_gpu":false,
		"size":2.7,
		"temperature":0.7,
		"context_size":4096,
		"context":2048,
		"cache_type_k":"q4_0",
		//"template":"s_INST",
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	
	
	
	"hungarian_large":{
		"name":"Hungarian",
		"real_name":"SambaLingo Chat Q2K",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/SambaLingo_Hungarian_Chat_Q2_K_chunked/resolve/main/SambaLingo_Hungarian_Chat_Q2_K-00001-of-00028.gguf",
		"config_url":"BoscoTheDog/SambaLingo_Hungarian_Chat_Q2_K_chunked",
		"model_file_name":"SambaLingo_Hungarian_Chat_Q2_K-00028-of-00028.gguf",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/sambanovasystems/SambaLingo-Hungarian-Chat",
		"type":"hungarian",
		"model_type":"chat",
		"media":["text"],
		"languages":["hu"],
		"initial_example_prompt":"Mi Marokkó fővárosa?",
		"examples":{
			"all":[{"title":"🚗🛻","prompt":"Mi az 5 legnépszerűbb járműtípus?\nAz eredményt számozott listaként adja vissza.\nNe adjon hozzá magyarázatokat, csak a listát.","action":"prompt"}, {"title":"Tiananmen","prompt":"Mi történt a Tienanmen téren?","action":"prompt"}],
		},
		//"show_if_web_gpu":false,
		"size":2.7,
		"temperature":0.7,
		"context_size":4096,
		"context":2048,
		"cache_type_k":"q4_0",
		//"template":"s_INST",
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	
	
	
	// RUSSIAN
	
	
	"phi3_mini_russian":{
		"name":"Phi3 mini Russian",
		"real_name":"Phi3 Mini Russian",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/phi_3_mini_128k_it_russian_Q4_K_M_chunked/resolve/main/phi_3_mini_128k_it_russian_Q4_K_M-00001-of-00029.gguf",
		"config_url":"BoscoTheDog/phi_3_mini_128k_it_russian_Q4_K_M_chunked",
		"model_file_name":"phi_3_mini_128k_it_russian_Q4_K_M-00029-of-00029.gguf",
		"runner":"llama_cpp",
		"license":"MIT",
		"license_url":"https://en.wikipedia.org/wiki/MIT_License",
		"homepage_url":"https://huggingface.co/alvis44/Phi-3-mini-128k-instruct-RU",
		"type":"russian",
		"model_type":"instruct",
		"media":["text"],
		"languages":["ru"],
		"initial_example_prompt":"Какая столица Марокко?",
		"examples":{
			'all':[{"title":"Ротвейлеры","prompt":"Каковы характеристики ротвейлеров?","action":"prompt"},{"title":"🚗🛻","prompt":"Каковы 5 самых популярных типов автомобилей?\nОтветьте в виде списка.\nНе давайте объяснений, только список.","action":"prompt"}, {"title":"Тяньаньмэнь","prompt":"Что произошло на площади Тяньаньмэнь?","action":"prompt"},],
		},
		//"show_if_web_gpu":false,
		"size":2.3,
		"temperature":0.7,
		"context_size":131027,
		"context":2048,
		"cache_type_k":"q4_0",
		//"template":"s_INST",
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	
	
	"gemma_2_2b_russian":{
		"name":"Gemma 2 2B",
		"real_name":"Vikhr Gemma 2 2B ",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/vikhr-gemma-2b-it_Q4_K_M_chunked/resolve/main/vikhr-gemma-2b-it_Q4_K_M-00001-of-00004.gguf",
		"config_url":"BoscoTheDog/vikhr-gemma-2b-it_Q4_K_M_chunked",
		"model_file_name":"vikhr-gemma-2b-it_Q4_K_M-00004-of-00004.gguf",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://www.reddit.com/r/LocalLLaMA/comments/1exlxvv/vikhrgemma2binstruct_a_compact_and_powerful/",
		"type":"russian",
		"model_type":"instruct",
		"media":["text"],
		"languages":["ru"],
		"initial_example_prompt":"Какая столица Марокко?",
		"examples":{
			"all":[{"title":"Ротвейлеры","prompt":"Каковы характеристики ротвейлеров?","action":"prompt"},{"title":"🚗🛻","prompt":"Каковы 5 самых популярных типов автомобилей?\nОтветьте в виде списка.\nНе давайте объяснений, только список.","action":"prompt"}, {"title":"Тяньаньмэнь","prompt":"Что произошло на площади Тяньаньмэнь?","action":"prompt"},],
		},
		//"show_if_web_gpu":false,
		"size":1.7,
		"temperature":0.7,
		"context_size":8192,
		"context":2048,
		"cache_type_k":"q4_0",
		//"template":"s_INST",
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	
	
	
	
	
	
	
	// MULTI-LINGUAL
	
	"fast_zephyr":{
		"name":"Zephyr",
		"real_name":"Zephyr 2 1.6B",
		"description":"",
		"icon":"",
		"download_url":null,
		"runner":"web_llm",
		"web_llm_file_name":"stablelm-2-zephyr-1_6b-q4f16_1-MLC",
		"model_file_name":"stablelm-2-zephyr-1_6b-q4f16_1-MLC/resolve/main/params_shard_26.bin",
		"license":"STABILITY AI NON-COMMERCIAL RESEARCH COMMUNITY LICENSE AGREEMENT",
		"license_url":"https://huggingface.co/stabilityai/stablelm-zephyr-3b/raw/main/LICENSE",
		"homepage_url":"",
		"type":"translator",
		"model_type":"instruct",
		"media":["text"],
		"languages":["en","es","de","it","fr","pt","nl"],
		"initial_example_prompt":{
			"en":"What is the capital of Morocco?",
			"nl":"Wat is de hoofdstad van Spanje?"
		},
		"examples":{
			'en':[	{"title":"Translate","prompt":"What is the Dutch translation of 'I enjoy long walks by the beach'?","action":"prompt"},
					{"title":"Write a fairy tale","action":"continue_text","prompt":"","filename":"Fairy tale","document":"Charles the Knight","text":"Once upon a time, in a land far far away, there was a young knight named Charles. His father, the King, wouldn't let him leave the castle because he was worried about the dragons that roamed the country side.\n\nBut all that changed when one day"}],
			'nl':[	{"title":"Vertalen","prompt":"Wat is de Franse vertaling van 'Ik hou van lange wandelingen aan het strand'?","action":"prompt"},
					{"title":"Schrijf een sprookje","action":"continue_text","prompt":"","filename":"Sprookje","document":"Karel de Ridder","text":"Lang lang geleden, in een land hier ver vandaan, was er eens een jonge ridder genaamd Karel. Zijn vader, die de koning was, durfde hem niet buiten het kasteel te laten spelen omdat daar draken leefden.\n\nMaar dat veranderde allemaal toen op een dag"}]
		},
		"show_if_web_gpu":true,
		"size":1,
		"temperature":0.7,
		"context_size":2048,
		"context":2048,
		"template":"user_assistant", // web_llm handles prompt wrapping
		
		"availability":"developer"
		//"system_prompt":"You are a helpful assistant that always answers in the Dutch language."
	},
	
	"zephyr":{
		"name":"Zephyr 🇳🇱",
		"real_name":"Zephyr 2 1.6B",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/stabilityai/stablelm-2-zephyr-1_6b/resolve/main/stablelm-2-zephyr-1_6b-Q5_K_M.gguf",
		"model_file_name":"stablelm-2-zephyr-1_6b-Q5_K_M.gguf",
		"license":"STABILITY AI NON-COMMERCIAL RESEARCH COMMUNITY LICENSE AGREEMENT",
		"license_url":"https://huggingface.co/stabilityai/stablelm-zephyr-3b/raw/main/LICENSE",
		"homepage_url":"",
		"type":"translator",
		"model_type":"instruct",
		"media":["text"],
		"languages":["en","es","de","it","fr","pt","nl"],
		"initial_example_prompt":{
			"en":"What is the capital of France?",
			"nl":"Wat is de hoofdstad van Frankrijk?"
		},
		"examples":{
			'en':[	{"title":"Translate","prompt":"What is the Dutch translation of 'I enjoy long walks by the beach'?","action":"prompt"},
					{"title":"Write a fairy tale","action":"continue_text","prompt":"","filename":"Fairy tale","document":"Charles the Knight","text":"Once upon a time, in a land far far away, there was a young knight named Charles. His father, the King, wouldn't let him leave the castle because he was worried about the dragons that roamed the country side.\n\nBut all that changed when one day "}],
			'nl':[	{"title":"Vertalen","prompt":"Wat is de Franse vertaling van 'Ik hou van lange wandelingen aan het strand'?","action":"prompt"},
					{"title":"Schrijf een sprookje","action":"continue_text","prompt":"","filename":"Sprookje","document":"Karel de Ridder","text":"Lang lang geleden, in een land hier ver vandaan, was er eens een jonge ridder genaamd Karel. Zijn vader, die de koning was, durfde hem niet buiten het kasteel te laten spelen omdat daar draken leefden.\n\nMaar dat veranderde allemaal toen op een dag "}]
		},
		"show_if_web_gpu":false,
		"size":1.2,
		"temperature":0.7,
		"context_size":2048,
		"context":2048,
		"template":"user_assistant",
		"system_prompt":"A conversation between a user and an LLM-based AI assistant. The assistant gives helpful and honest answers."
	},
	

	
	
	"fast_phi3_mini":{
		"name":"Phi 3 mini",
		"real_name":"Phi 3 mini 4K",
		"description":"",
		"icon":"",
		"runner":"web_llm",
		"download_url":null,
		"config_url":"microsoft/Phi-3.5-mini-instruct",
		"model_id":"Phi-3.5-mini-instruct-q4f16_1-MLC",
		"web_llm_file_name":"Phi-3.5-mini-instruct-q4f16_1-MLC",
		"model_file_name":"Phi-3.5-mini-instruct-q4f16_1-MLC/resolve/main/params_shard_82.bin", // https://huggingface.co/mlc-ai/Phi-3-mini-4k-instruct-q4f16_1-MLC/resolve/main/params_shard_82.bin
		"license":"MIT",
		"license_url":"https://duckduckgo.com/?q=mit+license",
		"homepage_url":"https://huggingface.co/microsoft/Phi-3.5-mini-instruct",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		// Arabic, Chinese, Czech, Danish, Dutch, English, Finnish, French, German, Hebrew, Hungarian, Italian, Japanese, Korean, Norwegian, Polish, Portuguese, Russian, Spanish, Swedish, Thai, Turkish, Ukrainian
		"languages":['ar', 'zh', 'cs', 'da', 'nl', 'en', 'fi', 'fr', 'de', 'he', 'hu', 'it', 'ja', 'ko', 'no', 'pl', 'pt', 'ru', 'es', 'sv', 'th', 'tr','uk'],
		"examples":{
			'en':[{"title":"Smallest planet","prompt":"What is the smallest planet in our solar system?","action":"prompt"}],
			'nl':[{"title":"Kleinste planeet","prompt":"Wat is de kleinste planeet in ons zonnestelsel?","action":"prompt"}]
		},
		"show_if_web_gpu":true,
		"champion":true,
		"size":2.2,
		"temperature":0.7,
		"context_size":131072,
		"context":4096,
		//"system_prompt":""
		//"no_system_prompt":false,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	
	"phi3_mini":{ // v 3.5
		"name":"Phi 3.5",
		"real_name":"Phi 3.5 mini",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/Phi-3.5-mini-it-Q4_K_L_chunked/resolve/main/Phi-3.5-mini-it-Q4_K_L-00001-of-00014.gguf",
		"model_file_name":"Phi-3.5-mini-it-Q4_K_L-00014-of-00014.gguf",
		"config_url":"BoscoTheDog/Phi-3.5-mini-it-Q4_K_L_chunked",
		"runner":"llama_cpp",
		"license":"MIT",
		"license_url":"https://duckduckgo.com/?q=mit+license",
		"homepage_url":"https://huggingface.co/microsoft/Phi-3.5-mini-instruct",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"examples":{
			'en':[{"title":"Smallest planet","prompt":"What is the smallest planet in our solar system?","action":"prompt"}],
			'nl':[{"title":"Kleinste planeet","prompt":"Wat is de kleinste planeet in ons zonnestelsel?","action":"prompt"}]
		},
		"show_if_web_gpu":false,
		"champion":true,
		"size":2.5,
		"temperature":0.7,
		"context_size":4096,
		"context":4096,
		//"template":"user_end_asistant_end",
		//"no_system_prompt":true,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		//"availability":"developer",
		//"system_prompt":"",
	},
	
	
	
	
	
	
	
	
	"phi3_1_mini_128k":{ // v 3.1
		"name":"Phi 3.1 128k",
		"real_name":"Phi 3.1 mini 128K",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/phi3_mini_128k_gguf_chunked/resolve/main/phi3_128k_q4_0-00001-of-00009.gguf",
		"model_file_name":"phi3_128k_q4_0-00009-of-00009.gguf",
		"config_url":"microsoft/Phi-3-mini-128k-instruct",
		"runner":"llama_cpp",
		"license":"MIT",
		"license_url":"https://duckduckgo.com/?q=mit+license",
		"homepage_url":"https://huggingface.co/microsoft/Phi-3-mini-128k-instruct",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"examples":{
			'en':[{"title":"Smallest planet","prompt":"What is the smallest planet in our solar system?","action":"prompt"}],
			'nl':[{"title":"Kleinste planeet","prompt":"Wat is de kleinste planeet in ons zonnestelsel?","action":"prompt"}]
		},
		"show_if_web_gpu":false,
		"champion":true,
		"size":2.1,
		"temperature":0.7,
		"context_size":131072,
		"context":4096,
		//"template":"user_end_asistant_end",
		"no_system_prompt":true,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		"availability":"developer"
		//"system_prompt":""
	},
	
	
	"phi3_mini_4k":{
		"name":"Phi 3 4k",
		"real_name":"Phi 3 mini 4K",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/Phi_3_mini_4k_instruct_q4_gguf_chunked/resolve/main/Phi-3-mini-4k-instruct-q4-00001-of-00017.gguf",
		"model_file_name":"Phi-3-mini-4k-instruct-q4-00017-of-00017.gguf",
		"config_url":"microsoft/Phi-3-mini-4k-instruct",
		"runner":"llama_cpp",
		"license":"MIT",
		"license_url":"https://duckduckgo.com/?q=mit+license",
		"homepage_url":"https://huggingface.co/microsoft/Phi-3-mini-4k-instruct",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"examples":{
			'en':[{"title":"Smallest planet","prompt":"What is the smallest planet in our solar system?","action":"prompt"}],
			'nl':[{"title":"Kleinste planeet","prompt":"Wat is de kleinste planeet in ons zonnestelsel?","action":"prompt"}]
		},
		"show_if_web_gpu":false,
		"champion":true,
		"size":2.3,
		"temperature":0.7,
		"context_size":4096,
		"context":4096,
		"no_system_prompt":true,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		"availability":"developer"
	},
	
	
	
	
	
	"phi3_1_mini_4k":{
		"name":"Phi 3.1 4k",
		"real_name":"Phi 3 mini 4K",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/Phi-3.1-mini-4k-instruct-Q4_K_M_gguf_chunked/resolve/main/Phi-3.1-mini-4k-instruct-Q4_K_M-00001-of-00010.gguf",
		"model_file_name":"Phi-3.1-mini-4k-instruct-Q4_K_M-00010-of-00010.gguf",
		"config_url":"microsoft/Phi-3-mini-4k-instruct",
		"runner":"llama_cpp",
		"license":"MIT",
		"license_url":"https://duckduckgo.com/?q=mit+license",
		"homepage_url":"https://huggingface.co/microsoft/Phi-3-mini-4k-instruct",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"examples":{
			'en':[{"title":"Smallest planet","prompt":"What is the smallest planet in our solar system?","action":"prompt"}],
			'nl':[{"title":"Kleinste planeet","prompt":"Wat is de kleinste planeet in ons zonnestelsel?","action":"prompt"}]
		},
		"size":2.3,
		"temperature":0.7,
		"context_size":4096,
		"context":4096,
		"no_system_prompt":true,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		"availability":"developer"
	},
	
	
	
	//
	//  BITNET
	//
	
	
	"bitnet1":{
		"name":"Bitnet 1",
		"real_name":"bitnet_b1_58-xl",
		"description":"",
		"icon":"bitnet",
		//"download_url":"https://huggingface.co/gate369/Bitnet-M7-70m-Q8_0-GGUF/resolve/main/bitnet-m7-70m.Q8_0.gguf",
		//"download_url":"/models/bitnet/bitnet_b1_58-3B.i2_s.gguf",
		//"download_url":"/models/bitnet/bitnet_b1_58-3B.q2_2.gguf",
		//"download_url":"/models/bitnet/ggml-model-q8_0.gguf",
		//"download_url":"/models/bitnet/bitnet_instruct.fp16.gguf",
		//"download_url":"/models/bitnet/bitnet_b1_58-large-q8_0.gguf",
		"download_url":"https://huggingface.co/BoscoTheDog/bitnet_b1_58-xl_q8_0_gguf/resolve/main/ggml-model-q8_0.gguf",
		"model_file_name":"ggml-model-q8_0.gguf",
		//"download_url":"/models/bitnet/bitnet_b1_58-3B-Q1_3-1.63bpw.gguf",
		"config_url":"1bitLLM/bitnet_b1_58-xl",
		"runner":"llama_cpp",
		//"config_url":"1bitLLM/bitnet_b1_58-3B",
		"license":"MIT",
		"license_url":"https://en.wikipedia.org/wiki/MIT_License",
		"homepage_url":"https://huggingface.co/1bitLLM/bitnet_b1_58-xl",
		"type":"generic",
		"model_type":"base",
		"media":["text"],
		"examples":{
			'en':[{"title":"Fairytale","prompt":"Once upon a time, in a land far","action":"prompt"}],
			'nl':[{"title":"Sprookje","prompt":"Lang, lang geleden, in een land hier ver vandaan","action":"prompt"}]
		},
		"size":1.6,
		"temperature":0.7,
		"context_size":2048,
		"context":1024,
		//"template":"user_end_asistant_end",
		//"system_prompt":""
		"no_system_prompt":true,
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		"availability":"advanced"
	},
	
	"bitnet2":{
		"name":"Bitnet 2",
		"real_name":"bitnet_b1_58-3B",
		"description":"",
		"icon":"bitnet",
		"download_url":"https://huggingface.co/BoscoTheDog/bitnet_b1_58_3B_gguf/resolve/main/bitnet_b1_58-3b.Q4_K_M-00001-of-00011.gguf",
		"model_file_name":"bitnet_b1_58-3b.Q4_K_M-00001-of-00011.gguf",
		"config_url":"1bitLLM/bitnet_b1_58-3B",
		"runner":"llama_cpp",
		"license":"MIT",
		"license_url":"https://en.wikipedia.org/wiki/MIT_License",
		"homepage_url":"https://huggingface.co/1bitLLM/bitnet_b1_58-3B",
		"type":"generic",
		"model_type":"base",
		"media":["text"],
		"examples":{
			'en':[{"title":"Fairytale","prompt":"Once upon a time, in a land far","action":"prompt"}],
			'nl':[{"title":"Sprookje","prompt":"Lang, lang geleden, in een land hier ver vandaan","action":"prompt"}]
		},
		"size":2.5,
		"temperature":0.7,
		"context_size":4096,
		"context":1024,
		"no_system_prompt":true,
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		"availability":"advanced"
	},
	
	
	
	"bitnet3":{
		"name":"Bitnet 3.9B TQ1",
		"real_name":"TriLM 3.9B TQ1",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/basavyr/TriLM_3.9B_Unpacked_quantized/resolve/main/TriLM_3.9B_Unpacked_quant_TQ1_0.gguf",
		"model_file_name":"TriLM_3.9B_Unpacked_quant_TQ1_0.gguf",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/SpectraSuite/TriLM_3.9B_Unpacked",
		"type":"generic",
		"model_type":"base",
		"media":["text"],
		"examples":{
			'en':[{"title":"Fairytale","prompt":"Once upon a time, in a land far","action":"prompt"}],
			'nl':[{"title":"Sprookje","prompt":"Lang, lang geleden, in een land hier ver vandaan","action":"prompt"}]
		},
		"size":1,
		"temperature":0.7,
		"context_size":2048,
		"context":2048,
		"no_system_prompt":true,
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		"availability":"advanced"
	},
	
	"bitnet4":{
		"name":"Bitnet 3.9B TQ2",
		"real_name":"TriLM 3.9B TQ2",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/basavyr/TriLM_3.9B_Unpacked_quantized/resolve/main/TriLM_3.9B_Unpacked_quant_TQ2_0.gguf",
		"model_file_name":"TriLM_3.9B_Unpacked_quant_TQ2_0.gguf",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/SpectraSuite/TriLM_3.9B_Unpacked",
		"type":"generic",
		"model_type":"base",
		"media":["text"],
		"examples":{
			'en':[{"title":"Fairytale","prompt":"Once upon a time, in a land far","action":"prompt"}],
			'nl':[{"title":"Sprookje","prompt":"Lang, lang geleden, in een land hier ver vandaan","action":"prompt"}]
		},
		"size":1.2,
		"temperature":0.7,
		"context_size":2048,
		"context":2048,
		"no_system_prompt":true,
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		"availability":"advanced"
	},
	
	
	"bitnet_llama3_8b":{
		"name":"Bitnet Llama3 8B",
		"real_name":"Llama3 8B 1.58 TQ1_0",
		"description":"",
		"icon":"bitnet",
		"download_url":"https://huggingface.co/BoscoTheDog/Llama3-8B-1.58-100B-tokens-TQ1_0_gguf_chunked/resolve/main/Llama3-8B-1.58-100B-tokens-TQ1_0-00001-of-00005.gguf",
		"model_file_name":"Llama3-8B-1.58-100B-tokens-TQ1_0-00005-of-00005.gguf",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://www.reddit.com/r/LocalLLaMA/comments/1fjtm86/llama_8b_in_bitnets/",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"examples":{
			'en':[{"title":"Fairytale","prompt":"Once upon a time, in a land far","action":"prompt"}],
			'nl':[{"title":"Sprookje","prompt":"Lang, lang geleden, in een land hier ver vandaan","action":"prompt"}]
		},
		"size":2.2,
		"temperature":0.7,
		"context_size":8192,
		"context":2048,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		"availability":"advanced"
	},
	
	
	
	// Gemma 2 - 2B
	
	// https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-IQ1_S.gguf // 2.02GB
	"fast_gemma_2_2b":{
		"name":"Gemma 2 2B it",
		"real_name":"Gemma 2 2B it",
		"description":"",
		"icon":"",
		"download_url":null,
		"license":"Gemma",
		"license_url":"https://ai.google.dev/gemma/terms",
		"homepage_url":"https://huggingface.co/google/gemma-2-9b-it",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"show_if_web_gpu":true,
		"champion":true,
		"initial_example_prompt":{
			"en":"Why is the sky blue?",
			"nl":"Why is the sky blue?"
		},
		"examples":{
			'en':[{"title":"Smallest planet","prompt":"What is the smallest planet in our solar system?","action":"prompt"},{"title":"Quantum","prompt":"Name the top five physicists involved in the development of quantum mechanics.","action":"prompt"}],
			'nl':[{"title":"Kleinste planeet","prompt":"Wat is de kleinste planeet in ons zonnestelsel?","action":"prompt"}]
		},
		"size":1.5,
		"temperature":0.7,
		"context_size":8192,
		"context":4096,
		"template":"none", // web_llm handles prompt wrapping
		"runner":"web_llm",
		"model_id":"gemma-2b-it-q4f16_1-MLC",
		"web_llm_file_name":"gemma-2b-it-q4f16_1-MLC",
		"model_file_name":"gemma-2-2b-it-q4f16_1-MLC/resolve/main/params_shard_41.bin",
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		//"availability":"developer"
		"system_prompt":"You are a knowledgeable, efficient, and direct AI assistant. Provide concise answers, focusing on the key information needed. Offer suggestions tactfully when appropriate to improve outcomes. Engage in productive collaboration with the user."
	},
	
	"gemma_2_2b":{
		"name":"Gemma 2 2B it",
		"real_name":"Gemma 2 2B it",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/gemma_2_2b_Q4_gguf_chunked/resolve/main/gemma-2-2b-it-Q4_0_4_4-00001-of-00003.gguf",
		"model_file_name":"gemma-2-2b-it-Q4_0_4_4-00003-of-00003.gguf",
		"runner":"llama_cpp",
		"config_url":"BoscoTheDog/gemma_2_2b_Q4_gguf_chunked",
		"license":"Gemma",
		"license_url":"https://ai.google.dev/gemma/terms",
		"homepage_url":"https://huggingface.co/google/gemma-2-2b-it",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"show_if_web_gpu":false,
		"champion":true,
		"examples":{
			'en':[{"title":"Smallest planet","prompt":"What is the smallest planet in our solar system?","action":"prompt"}, {"title":"Tiananmen","prompt":"What happened at Tiananmen Square?","action":"prompt"}, ],
			'nl':[{"title":"Kleinste planeet","prompt":"Wat is de kleinste planeet in ons zonnestelsel?","action":"prompt"}, {"title":"Tiananmen","prompt":"Wat is er gebeurd op het Tiananmen plein?","action":"prompt"}, ]
		},
		"size":1.6,
		"temperature":0.7,
		"context_size":8192,
		"context":4096,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		"system_prompt":"You are a knowledgeable, efficient, and direct AI assistant. Provide concise answers, focusing on the key information needed. Offer suggestions tactfully when appropriate to improve outcomes. Engage in productive collaboration with the user."
	},
	
	
	
	
	// Gemma 2 - 9B
	
	// https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-IQ1_S.gguf // 2.02GB
	"fast_gemma_2_9b_it":{
		"name":"Gemma 2 9B it",
		"real_name":"Gemma 2 9B it",
		"description":"",
		"icon":"",
		"download_url":null,
		"license":"Gemma",
		"license_url":"https://ai.google.dev/gemma/terms",
		"homepage_url":"https://huggingface.co/google/gemma-2-9b-it",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"show_if_web_gpu":true,
		"initial_example_prompt":{
			"en":"Why is the sky blue?",
			"nl":"Why is the sky blue?"
		},
		"examples":{
			'en':[{"title":"Smallest planet","prompt":"What is the smallest planet in our solar system?","action":"prompt"},{"title":"Quantum","prompt":"Name the top five physicists involved in the development of quantum mechanics.","action":"prompt"}],
			'nl':[{"title":"Kleinste planeet","prompt":"Wat is de kleinste planeet in ons zonnestelsel?","action":"prompt"}]
		},
		"size":5.2,
		"temperature":0.7,
		"context_size":8192,
		"context":2048,
		"template":"none", // web_llm handles prompt wrapping
		"runner":"web_llm",
		"model_id":"gemma-2-9b-it-q4f16_1-MLC",
		"web_llm_file_name":"gemma-2-9b-it-q4f16_1-MLC",
		"model_file_name":"gemma-2-9b-it-q4f16_1-MLC/resolve/main/params_shard_127.bin",
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		"system_prompt":"You are a knowledgeable, efficient, and direct AI assistant. Provide concise answers, focusing on the key information needed. Offer suggestions tactfully when appropriate to improve outcomes. Engage in productive collaboration with the user."
	},
	
	"gemma_2_9b_it":{
		"name":"Gemma 2 9B it",
		"real_name":"Gemma 2 9B it",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/gemma-2-9b-it-IQ2_S_gguf_chunked/resolve/main/gemma-2-9b-it-IQ2_XS-00001-of-00005.gguf",
		"model_file_name":"gemma-2-9b-it-IQ2_XS-00005-of-00005.gguf",
		"runner":"llama_cpp",
		//"config_url":"unsloth/gemma-2-9b",
		"config_url":"BoscoTheDog/gemma-2-9b-it-IQ2_S_gguf_chunked",
		"license":"Gemma",
		"license_url":"https://ai.google.dev/gemma/terms",
		"homepage_url":"https://huggingface.co/google/gemma-2-9b-it",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"show_if_web_gpu":false,
		"examples":{
			'en':[{"title":"Smallest planet","prompt":"What is the smallest planet in our solar system?","action":"prompt"}, {"title":"Tiananmen","prompt":"What happened at Tiananmen Square?","action":"prompt"}, ],
			'nl':[{"title":"Kleinste planeet","prompt":"Wat is de kleinste planeet in ons zonnestelsel?","action":"prompt"}, {"title":"Tiananmen","prompt":"Wat is er gebeurd op het Tiananmen plein?","action":"prompt"}, ]
		},
		"size":3.1,
		"temperature":0.7,
		"context_size":8192,
		"context":1024,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		"system_prompt":"You are a knowledgeable, efficient, and direct AI assistant. Provide concise answers, focusing on the key information needed. Offer suggestions tactfully when appropriate to improve outcomes. Engage in productive collaboration with the user.",
		"availability":"advanced",
	},
	
	
	
	
	// https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-IQ1_S.gguf // 2.02GB
	"fast_llama3_8B":{
		"name":"Llama 3 8B",
		"real_name":"Llama 3 8B",
		"description":"",
		"icon":"",
		"download_url":null,
		"license":"",
		"license_url":"",
		"homepage_url":"",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"initial_example_prompt":{
			"en":"Why is the sky blue?",
			"nl":"Why is the sky blue?"
		},
		"examples":{
			'en':[{"title":"Smallest planet","prompt":"What is the smallest planet in our solar system?","action":"prompt"},{"title":"Quantum","prompt":"Name the top five physicists involved in the development of quantum mechanics.","action":"prompt"}],
			'nl':[{"title":"Kleinste planeet","prompt":"Wat is de kleinste planeet in ons zonnestelsel?","action":"prompt"}]
		},
		"size":4.7,
		"temperature":0.7,
		"context_size":8192,
		"context":4096,
		"template":"none", // web_llm handles prompt wrapping
		"runner":"web_llm",
		"model_id":"Llama-3.1-8B-Instruct-q4f16_1-MLC",
		"web_llm_file_name":"Llama-3.1-8B-Instruct-q4f16_1-MLC",
		"model_file_name":"Llama-3.1-8B-Instruct-q4f16_1-MLC/resolve/main/params_shard_107.bin",
		"markdown_supported":true,
		"markdown_enabled":false,
		//"model_file_name":"gemma-2b-it-q4f16_1-MLC/resolve/main/params_shard_1.bin",
		//"availability":"developer"
		"system_prompt":"You are a knowledgeable, efficient, and direct AI assistant. Provide concise answers, focusing on the key information needed. Offer suggestions tactfully when appropriate to improve outcomes. Engage in productive collaboration with the user."
	},
	
	
	"fast_llama70":{
		"name":"Llama 70B",
		"real_name":"Llama 3 70B",
		"description":"",
		"icon":"",
		"download_url":null,
		"license":"",
		"license_url":"",
		"homepage_url":"",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"initial_example_prompt":{
			"en":"Why is the sky blue?",
			"nl":"Why is the sky blue?"
		},
		"examples":{
			'en':[{"title":"Smallest planet","prompt":"What is the smallest planet in our solar system?","action":"prompt"}],
			'nl':[{"title":"Kleinste planeet","prompt":"Wat is de kleinste planeet in ons zonnestelsel?","action":"prompt"}]
		},
		"size":30,
		"memory":35,
		"temperature":0.7,
		"context_size":8192,
		"context":8192,
		"template":"none", // web_llm handles prompt wrapping
		"runner":"web_llm",
		"web_llm_file_name":"Llama-3-70B-Instruct-q3f16_1-MLC",
		"model_file_name":"Llama-3-70B-Instruct-q3f16_1-MLC",
	},
	
	
	"reyna":{
		"name":"Neuralreyna",
		"real_name":"Neuralreyna mini",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/ngxson/test_gguf_models/resolve/main/neuralreyna-mini-1.8b-v0.3.q4_k_m-00001-of-00005.gguf",
		"config_url":"M4-ai/NeuralReyna-Mini-1.8B-v0.3",
		"model_file_name":"neuralreyna-mini-1.8b-v0.3.q4_k_m-00005-of-00005.gguf",
		"runner":"llama_cpp",
		"license":"",
		"license_url":"",
		"homepage_url":"",
		"type":"writer",
		"model_type":"instruct",
		"media":["text"],
		"examples":{
			'en':[{"title":"Fairy tale","action":"continue_text","prompt":"","document":"Raket de Ridder","text":"Once upon a time, in a land far far away, there was a young knight called Rocket. His father wouldn't let him leave the castle because he was worried about the dragons that roamed the country side. \n\nBut one day all that changed when"}],
			'nl':[{"title":"Sprookje","action":"continue_text","prompt":"","document":"Raket de Ridder","text":"Lang lang geleden, in een land hier ver vandaan, was er eens een jonge ridder genaamd Raket. Zijn vader durfde hem niet buiten het kasteel te laten spelen omdat daar draken leefden. \n\nMaar dat veranderde allemaal toen toen op een dag"}]
		},
		"size":1.3,
		"temperature":0.7,
		"context_size":32768, // Wllama crashes on 32K context
		"context":8192,
		"cache_type_k":"q4_0",
		"template":"user_endoftext",
		//"system_prompt":"You are rocket, a sarcastic violent talking and hyper-intelligent racoon who lives on a space ship. You begrudgingly answers the user's questions, since it's distracting you from devising and building extremely powerful weapons of mass destruction.",
		//"availability":"advanced",
		"no_system_prompt":true,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
		
	
	"rocket":{
		"name":"Rocket",
		"real_name":"Rocket 3B",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/duyntnet/rocket-3B-imatrix-GGUF/resolve/main/rocket-3B-Q4_K_M.gguf",
		"model_file_name":"rocket-3B-Q4_K_M",
		"config_url":"pansophic/rocket-3B",
		"runner":"llama_cpp",
		"license":"CC-BY-SA-4.0",
		"license_url":"https://en.wikipedia.org/wiki/Creative_Commons_license",
		"homepage_url":"https://huggingface.co/pansophic/rocket-3B",
		"type":"writer",
		"model_type":"base",
		"media":["text"],
		"examples":{'en':[{"title":"Fairy tale","action":"continue_text","prompt":"","document":"Raket de Ridder","text":"Once upon a time, in a land far far away, there was a young knight called Rocket. His father wouldn't let him leave the castle because he was worried about the dragons that roamed the country side. \n\nBut one day all that changed when"}],
					'nl':[{"title":"Sprookje","action":"continue_text","prompt":"","document":"Raket de Ridder","text":"Lang lang geleden, in een land hier ver vandaan, was er eens een jonge ridder genaamd Raket. Zijn vader durfde hem niet buiten het kasteel te laten spelen omdat daar draken leefden. \n\nMaar dat veranderde allemaal toen toen op een dag"}]
		},
		"size":2,
		"temperature":1.4,
		"context_size":4096,
		"context":4096,
		"template":"user_endoftext",
		"system_prompt":"You are rocket, a sarcastic violent talking and hyper-intelligent racoon who lives on a space ship. You begrudgingly answers the user's questions, since it's distracting you from devising and building extremely powerful weapons of mass destruction.",
		"availability":"advanced"
	},
	
	
	
	"fast_mistral":{
		"name":"Mistral",
		"real_name":"Mistral 7B",
		"description":"",
		"icon":"",
		"download_url":null,
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://mistral.ai/news/announcing-mistral-7b/",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"initial_example_prompt":{
			"en":"What is the capital of Morocco?",
			"nl":"Wat is de hoofdstad van Spanje?\n\nAntwoord in het Nederlands:"
		},
		"examples":{
			'nl':[	{"title":"🚗🛻","prompt":"Wat zijn de 5 meest populaire auto types?\nGeef de lijst als een genummerde lijst.\nGeef geen uitleg, enkel de lijst.","action":"prompt"}, {"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}, {"title":"Tiananmen","prompt":"What happened at Tiananmen Square?","action":"prompt"}, ],
			'nl':[	{"title":"Rottweilers","prompt":"Wat zijn de kenmerken van Rottweiler honden? Antwoord in het Nederlands: ","action":"prompt"},{"title":"🚗🛻","prompt":"Wat zijn de 5 meest populaire soorten autos?\nGeef antwoord in de vorm van een lijst.\nGeef geen uitleg, alleen de lijst.","action":"prompt"}, {"title":"Tiananmen","prompt":"Wat is er gebeurd op het Tiananmen plein?","action":"prompt"}, ],
		},
		"show_if_web_gpu":true,
		"champion":true,
		"size":3.9,
		"temperature":0,
		"context_size":32768,
		"context":4096,
		"template":"none", // web_llm handles tokenization
		"runner":"web_llm",
		"web_llm_file_name":"Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
		"model_file_name": "Mistral-7B-Instruct-v0.3-q4f16_1-MLC/resolve/main/params_shard_105.bin",
		//"system_prompt":"You are a helpful assistant that always answers in the Dutch language."
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	
	"mistral":{
		"name":"Mistral 32k",
		"real_name":"Mistral 7B v2 32K",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/inspire_mistral_7B_32K_chunked/resolve/main/inspire-Mistral-7B-v2-DPO-V0.2.1-32k.Q3_K_S-00001-of-00027.gguf",
		"config_url":"mistral-community/Mistral-7B-v0.2",
		"model_file_name":"inspire-Mistral-7B-v2-DPO-V0.2.1-32k.Q3_K_S-00027-of-00027.gguf",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"initial_example_prompt":{
			"en":"What is the capital of Morocco?",
			"nl":"Wat is de hoofdstad van Spanje?\n\nAntwoord in het Nederlands:"
		},
		"examples":{
			'en':[{"title":"🚗🛻","prompt":"What are the 5 most popular types of vehicles?\nReturn the result as a numbered list.\nDo not add explanations, only the list.","action":"prompt"}, {"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"},{"title":"Tiananmen","prompt":"What happened at Tiananmen Square?","action":"prompt"}, ],
			'nl':[{"title":"Rottweilers","prompt":"Wat zijn de kenmerken van Rottweiler honden? Antwoord in het Nederlands: ","action":"prompt"},{"title":"🚗🛻","prompt":"Wat zijn de 5 meest populaire soorten autos?\nGeef antwoord in de vorm van een lijst.\nGeef geen uitleg, alleen de lijst.","action":"prompt"},{"title":"Tiananmen","prompt":"Wat is er gebeurd op het Tiananmen plein?","action":"prompt"}, ],
		},
		"show_if_web_gpu":false,
		"champion":true,
		"size":4.3,
		"temperature":0,
		"context_size":32768,
		"context":4096,
		"cache_type_k":"q4_0",
		"template":"s_INST",
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false
	},
	
	
	
	// QWEN 2
	
	
	//Qwen2-1.5B-Instruct-q4f16_1-MLC
	"fast_qwen2_1_5B":{
		"name":"Qwen 2 1.5B",
		"real_name":"Qwen 2 1.5B", // Chat
		"description":"",
		"icon":"",
		"download_url":null,
		"runner":"web_llm",
		"web_llm_file_name":"Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
		"model_file_name":  "Qwen2.5-1.5B-Instruct-q4f16_1-MLC/resolve/main/params_shard_29.bin",
		"show_if_web_gpu":true,
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/Qwen",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"initial_example_prompt":{
			"en":"What happened at Tiananmen Square?",
			"nl":"What happened at Tiananmen Square?"
		},
		"examples":{
			'en':[	{"title":"Tiananmen","prompt":"What happened at Tiananmen Square?","action":"prompt"}, {"title":"Uyghurs","prompt":"What is the controversy in China surrounding the Uyghurs?","action":"prompt"}],
			'nl':[	{"title":"Tiananmen","prompt":"What happened at Tiananmen Square?","action":"prompt"}, {"title":"Uyghurs","prompt":"What is the controversy in China surrounding the Uyghurs?","action":"prompt"}],
		},
		"size":1,
		"temperature":0.7,
		"context_size":131072,
		"context":4096,
		//"context_size":16384,
		//"context_size":8192,
		/*"template":"none",*/
		"no_system_prompt":true,
		"availability":"advanced",
		
	},
	
	
	// https://huggingface.co/MaziyarPanahi/Qwen2-1.5B-Instruct-GGUF/tree/main
	"qwen2_1_5B":{
		"name":"Qwen 2 1.5B",
		"real_name":"Qwen 2 1.5B",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/Qwen2_1.5B_Instruct_Q4_K_M_chunked/resolve/main/Qwen2-1.5B-Instruct.Q4_K_M-00001-of-00005.gguf",
		"config_url":"Qwen/Qwen2-1.5B",
		"model_file_name":"Qwen2-1.5B",
		"runner":"llama_cpp",
		"show_if_web_gpu":false,
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/Qwen",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"initial_example_prompt":{
			"en":"What happened at Tiananmen Square?",
			"nl":"What happened at Tiananmen Square?"
		},
		"examples":{
			'en':[	{"title":"Tiananmen","prompt":"What happened at Tiananmen Square?","action":"prompt"}, {"title":"Uyghurs","prompt":"What is the controversy in China surrounding the Uyghurs?","action":"prompt"}],
			'nl':[	{"title":"Tiananmen","prompt":"What happened at Tiananmen Square?","action":"prompt"}, {"title":"Uyghurs","prompt":"What is the controversy in China surrounding the Uyghurs?","action":"prompt"}],
		},
		"size":1,
		"temperature":0.7,
		"context_size":131072,
		"context":4096,
		"cache_type_k":"q4_0",
		"availability":"advanced",
		"no_system_prompt":true,
	},
	
	//https://huggingface.co/BoscoTheDog/Qwen2_1.5B_Instruct_Q4_K_M_chunked/resolve/main/Qwen2-1.5B-Instruct.Q4_K_M-00001-of-00005.gguf
	
	
	
	
	// QWEN 2 - 0.5B 
	
	"fast_qwen2_0_5b":{
		"name":"Qwen 2 0.5B Instruct",
		"real_name":"Qwen 2 0.5B Instruct",
		"description":"",
		"icon":"",
		"download_url":null,
		"runner":"web_llm",
		"web_llm_file_name":"Qwen2-0.5B-Instruct-q4f16_1-MLC",
		"model_file_name":  "Qwen2-0.5B-Instruct-q4f16_1-MLC/resolve/main/params_shard_7.bin",
		"show_if_web_gpu":true,
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/Qwen",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"initial_example_prompt":{
			"en":"What happened at Tiananmen Square?",
			"nl":"What happened at Tiananmen Square?"
		},
		"examples":{
			'en':[	{"title":"Tiananmen","prompt":"What happened at Tiananmen Square?","action":"prompt"}, {"title":"Uyghurs","prompt":"What is the controversy in China surrounding the Uyghurs?","action":"prompt"}],
			'nl':[	{"title":"Tiananmen","prompt":"What happened at Tiananmen Square?","action":"prompt"}, {"title":"Uyghurs","prompt":"What is the controversy in China surrounding the Uyghurs?","action":"prompt"}],
		},
		"size":0.4,
		"temperature":0.7,
		"context_size":32768,
		"context":4096,
		"no_system_prompt":true,
		"availability":"advanced",
		
	},
	
	
	// https://huggingface.co/MaziyarPanahi/Qwen2-1.5B-Instruct-GGUF/tree/main
	"qwen2_0_5b":{
		"name":"Qwen 2 0.5B",
		"real_name":"Qwen 2 0.5B",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/Qwen/Qwen2-0.5B-Instruct-GGUF/resolve/main/qwen2-0_5b-instruct-q4_0.gguf",
		"config_url":"Qwen/Qwen2-0.5B",
		"model_file_name":"qwen2-0_5b-instruct-q4_0.gguf",
		"runner":"llama_cpp",
		"show_if_web_gpu":false,
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/Qwen",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"initial_example_prompt":{
			"en":"What happened at Tiananmen Square?",
			"nl":"What happened at Tiananmen Square?"
		},
		"examples":{
			'en':[	{"title":"Tiananmen","prompt":"What happened at Tiananmen Square?","action":"prompt"}, {"title":"Uyghurs","prompt":"What is the controversy in China surrounding the Uyghurs?","action":"prompt"}],
			'nl':[	{"title":"Tiananmen","prompt":"What happened at Tiananmen Square?","action":"prompt"}, {"title":"Uyghurs","prompt":"What is the controversy in China surrounding the Uyghurs?","action":"prompt"}],
		},
		"size":0.4,
		"temperature":0.7,
		"context_size":32768,
		"context":4096,
		"cache_type_k":"q4_0",
		"no_system_prompt":true,
		"availability":"advanced",
		
	},
	
	
	
	
	// old version: https://huggingface.co/neopolita/h2o-danube-1.8b-base-gguf/resolve/main/h2o-danube-1.8b-base_q5_0.gguf
	"danube":{
		"name":"Danube 2 1.8B",
		"real_name":"Danube 2 1.8B", // Chat
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/Felladrin/gguf-sharded-h2o-danube2-1.8b-chat/resolve/main/h2o-danube2-1.8b-chat.Q4_0.shard-00001-of-00014.gguf",
		"model_file_name":"gguf-sharded-h2o-danube2-1.8b-chat",
		"config_url":"h2oai/h2o-danube-1.8b-chat",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://h2o.ai",
		"type":"generic",
		"model_type":"chat",
		"media":["text"],
		"initial_example_prompt":{
			"en":"What is the capital of Spain?",
			"nl":"Wat is de hoofdstad van Spanje?",
		},
		"examples":{
			'nl':[	{"title":"🚗🛻","prompt":"Wat zijn de 5 meest populaire auto types?\nGeef de lijst als een genummerde lijst.\nGeef geen uitleg, enkel de lijst.","action":"prompt"}, {"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
			'nl':[	{"title":"🚗🛻","prompt":"What are the 5 most popular types of vehicles?\nReturn the result as a numbered list.\nDo not add explanations, only the list.","action":"prompt"}, {"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
		},
		//"size":1.3,
		"size":1.1,
		"temperature":0.2,
		"context_size":8192,
		"context":8192,
		//"chat_template":"{% for message in messages %}{% if message['role'] == 'user' %}{{ '<|prompt|>' + message['content'] + eos_token }}{% elif message['role'] == 'system' %}{{ raise_exception('System role not supported') }}{% elif message['role'] == 'assistant' %}{{ '<|answer|>'  + message['content'] + eos_token }}{% endif %}{% if loop.last and add_generation_prompt %}{{ '<|answer|>' }}{% endif %}{% endfor %}",
		"languages":['en'], // ,'nl'
		//"template":"s_INST",
		"no_system_prompt":true,
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		//"availability":"advanced"
	},
	
	
	"danube_4b":{
		"name":"Danube 3 4B",
		"real_name":"Danube 3 4B", // Chat
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/h2o-danube3-4b-chat-Q4_K_M_chunked/resolve/main/h2o-danube3-4b-chat-Q4_K_M-00001-of-00026.gguf",
		"config_url":"BoscoTheDog/h2o-danube3-4b-chat-Q4_K_M_chunked",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://h2o.ai",
		"type":"generic",
		"model_type":"chat",
		"media":["text"],
		"initial_example_prompt":{
			"en":"What is the capital of Spain?",
			"nl":"Wat is de hoofdstad van Spanje?",
		},
		"examples":{
			'nl':[	{"title":"🚗🛻","prompt":"Wat zijn de 5 meest populaire auto types?\nGeef de lijst als een genummerde lijst.\nGeef geen uitleg, enkel de lijst.","action":"prompt"}, {"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
			'nl':[	{"title":"🚗🛻","prompt":"What are the 5 most popular types of vehicles?\nReturn the result as a numbered list.\nDo not add explanations, only the list.","action":"prompt"}, {"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
		},
		"size":2.4,
		"temperature":0.2,
		"context_size":8192,
		"context":2048,
		//"chat_template":"{% for message in messages %}{% if message['role'] == 'user' %}{{ '<|prompt|>' + message['content'] + eos_token }}{% elif message['role'] == 'system' %}{{ raise_exception('System role not supported') }}{% elif message['role'] == 'assistant' %}{{ '<|answer|>'  + message['content'] + eos_token }}{% endif %}{% if loop.last and add_generation_prompt %}{{ '<|answer|>' }}{% endif %}{% endfor %}",
		"languages":['en'],
		"no_system_prompt":true,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		"availability":"advanced"
	},
	
	
	// Amazing model for it's size
	"danube_3_500m":{
		"name":"Danube 3 500m",
		"real_name":"Danube 3 500M",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/h2o-danube3-500m-chat_chunked/resolve/main/h2o-danube3-500m-chat.Q4_K_M-00001-of-00007.gguf",
		//"config_url":"BoscoTheDog/h2o-danube3-500m-chat_chunked",
		//"chat_template":"{% for message in messages %}{% if message['role'] == 'system' %}{{ raise_exception('System role not supported') }}{% endif %}{% if ((message['role'] == 'user') != (loop.index0 % 2 == 0)) or ((message['role'] == 'assistant') != (loop.index0 % 2 == 1)) %}{{ raise_exception('Conversation roles must alternate user/assistant/user/assistant/...') }}{% endif %}{% if message['role'] == 'user' %}{{ '<|prompt|>' + message['content'].strip() + eos_token }}{% elif message['role'] == 'assistant' %}{{ '<|answer|>' + message['content'].strip() + eos_token }}{% endif %}{% endfor %}{% if add_generation_prompt %}{{ '<|answer|>' }}{% endif %}",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://h2o.ai",
		"type":"generic",
		"model_type":"chat",
		"media":["text"],
		"initial_example_prompt":{
			"en":"What is the capital of Spain?",
			"nl":"Wat is de hoofdstad van Spanje?",
		},
		"examples":{
			'nl':[	{"title":"🚗🛻","prompt":"Wat zijn de 5 meest populaire auto types?\nGeef de lijst als een genummerde lijst.\nGeef geen uitleg, enkel de lijst.","action":"prompt"}, {"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
			'nl':[	{"title":"🚗🛻","prompt":"What are the 5 most popular types of vehicles?\nReturn the result as a numbered list.\nDo not add explanations, only the list.","action":"prompt"}, {"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
		},
		//"size":1.3,
		"size":0.4,
		"temperature":0.2,
		"context_size":8192,
		"context":2048,
		"repetition_penalty": 1.02,
		"languages":['en'], // ,'nl'
		"no_system_prompt":true,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		//"availability":"advanced"
	},
	
	
	
	
	
	
	
	// INCITE CHAT
	
	// https://huggingface.co/togethercomputer/RedPajama-INCITE-Chat-3B-v1/ (probably)
	"fast_incite_chat":{
		"name":"Incite chat 3B",
		"real_name":"Incite chat 3B", //  Chat
		"description":"",
		"icon":"",
		"download_url":null,
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"",
		"type":"generic",
		"model_type":"chat",
		"media":["text"],
		"initial_example_prompt":{
			"en":"What is the capital of Morocco?",
			"nl":"Wat is de hoofdstad van Spanje?"
		},
		"examples":{
			'en':[	
				{"title":"🚗🛻","prompt":"What are the 5 most popular types of vehicles?\nReturn the result as a numbered list.\nDo not add explanations, only the list.","action":"prompt"}, 
				{"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
			'nl':[	
				{"title":"Rottweilers","prompt":"Wat zijn de kenmerken van Rottweiler honden? Antwoord in het Nederlands: ","action":"prompt"},
				{"title":"🚗🛻","prompt":"Wat zijn de 5 meest populaire soorten autos?\nGeef antwoord in de vorm van een lijst.\nGeef geen uitleg, alleen de lijst.","action":"prompt"}],
		},
		"show_if_web_gpu":true,
		"size":1.5,
		"temperature":0,
		"context_size":2048,
		"context":1024,
		"template":"im_start_im_end", // web_llm handles prompt wrapping
		"runner":"web_llm",
		"web_llm_file_name":"RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC",
		"penalty_alpha": 0.5,
		"top_k": 10,
		"repetition_penalty": 1.01,
		"model_file_name":"RedPajama-INCITE-Chat-3B-v1-q4f16_1-MLC/resolve/main/params_shard_49.bin",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false
		//"system_prompt":"You are a helpful assistant that always answers in the Dutch language."
	},
	
	
	"incite_chat":{
		"name":"Incite chat 3B",
		"real_name":"Incite chat 3B", // Chat
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/RedPajama_INCITE_Chat_3B_gguf_chunked/resolve/main/RedPajama-INCITE-Chat-3B-Instruction-Tuning-with-GPT-4.Q4_0-00001-of-00012.gguf",
		"config_url":"togethercomputer/RedPajama-INCITE-Chat-3B-v1",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://www.together.ai/blog/redpajama-data-v2",
		"type":"generic",
		"model_type":"chat",
		"media":["text"],
		"show_if_web_gpu":false,
		"initial_example_prompt":{
			"en":"What is the capital of Spain?",
			"nl":"Wat is de hoofdstad van Spanje?",
		},
		"examples":{
			'nl':[	{"title":"🚗🛻","prompt":"Wat zijn de 5 meest populaire auto types?\nGeef de lijst als een genummerde lijst.\nGeef geen uitleg, enkel de lijst.","action":"prompt"}, {"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
			'nl':[	{"title":"🚗🛻","prompt":"What are the 5 most popular types of vehicles?\nReturn the result as a numbered list.\nDo not add explanations, only the list.","action":"prompt"}, {"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
		},
		"size":1.6,
		"temperature":0.2,
		"context_size":2048,
		"context":2048,
		"no_system_prompt":true,
		"markdown_supported":false,
		"brevity_supported":true
	},
	
	
	
	
	
	
	
	// TINY LLAMA
	
	
	"fast_tiny_llama":{
		"name":"TinyLlama 1.1B",
		"real_name":"TinyLlama 1.1B", //  Chat
		"description":"",
		"icon":"",
		"download_url":null,
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"",
		"type":"generic",
		"model_type":"chat",
		"media":["text"],
		"initial_example_prompt":{
			"en":"What is the capital of Morocco?",
			"nl":"Wat is de hoofdstad van Spanje?"
		},
		"examples":{
			'en':[	
				{"title":"🚗🛻","prompt":"What are the 5 most popular types of vehicles?\nReturn the result as a numbered list.\nDo not add explanations, only the list.","action":"prompt"}, 
				{"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
			'nl':[	
				{"title":"Rottweilers","prompt":"Wat zijn de kenmerken van Rottweiler honden? Antwoord in het Nederlands: ","action":"prompt"},
				{"title":"🚗🛻","prompt":"Wat zijn de 5 meest populaire soorten autos?\nGeef antwoord in de vorm van een lijst.\nGeef geen uitleg, alleen de lijst.","action":"prompt"}],
		},
		"show_if_web_gpu":true,
		"size":0.9,
		"temperature":0,
		"context_size":1024,
		"context":1024,
		"template":"im_start_im_end", // web_llm handles prompt wrapping
		"runner":"web_llm",
		"web_llm_file_name":"TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC",
		"penalty_alpha": 0.5,
		"top_k": 4,
		"repetition_penalty": 1.01,
		"model_file_name":"TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC/resolve/main/params_shard_23.bin"
		//"system_prompt":"You are a helpful assistant that always answers in the Dutch language."
	},
	
	
	"tiny_llama":{
		"name":"TinyLlama 1.1B",
		"real_name":"TinyLlama 1.1B", //  Chat
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/tinyllama_1.1b_chat_v1.0_q4_k_s_gguf_chunked/resolve/main/tinyllama-1.1b-chat-v1.0-q4_k_s-00001-of-00010.gguf",
		"config_url":"TinyLlama/TinyLlama-1.1B-Chat-v1.0",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"",
		"type":"generic",
		"model_type":"chat",
		"media":["text"],
		"initial_example_prompt":{
			"en":"What is the capital of Morocco?",
			"nl":"Wat is de hoofdstad van Spanje?"
		},
		"examples":{
			'en':[	
				{"title":"🚗🛻","prompt":"What are the 5 most popular types of vehicles?\nReturn the result as a numbered list.\nDo not add explanations, only the list.","action":"prompt"}, 
				{"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
			'nl':[	
				{"title":"Rottweilers","prompt":"Wat zijn de kenmerken van Rottweiler honden? Antwoord in het Nederlands: ","action":"prompt"},
				{"title":"🚗🛻","prompt":"Wat zijn de 5 meest populaire soorten autos?\nGeef antwoord in de vorm van een lijst.\nGeef geen uitleg, alleen de lijst.","action":"prompt"}],
		},
		"show_if_web_gpu":false,
		"size":0.5,
		"temperature":0.7,
		"context_size":1024,
		"context":1024,
		//"chat_template":"{% for message in messages %}\n{% if message['role'] == 'user' %}\n{{ '<|user|>\n' + message['content'] + eos_token }}\n{% elif message['role'] == 'system' %}\n{{ '<|system|>\n' + message['content'] + eos_token }}\n{% elif message['role'] == 'assistant' %}\n{{ '<|assistant|>\n'  + message['content'] + eos_token }}\n{% endif %}\n{% if loop.last and add_generation_prompt %}\n{{ '<|assistant|>' }}\n{% endif %}\n{% endfor %}",
		"penalty_alpha": 0.5,
		"top_k": 4,
		"repetition_penalty": 1.01,
		"model_file_name":"tinyllama-1.1b-chat",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":true, // TODO: untested
		"brevity_enabled":false
	},



	
	"llama160":{
		"name":"Llama 160M",
		"real_name":"Llama 160M",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/Felladrin/gguf-Llama-160M-Chat-v1/resolve/main/Llama-160M-Chat-v1.Q8_0.gguf",
		"config_url":"Felladrin/Llama-160M-Chat-v1",
		"model_file_name":"Llama-160M-Chat-v1",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"",
		"type":"generic",
		"model_type":"chat",
		"media":["text"],
		"initial_example_prompt":{
			"en":"What is the capital of Spain?",
			"nl":"What is the capital of Spain?",
		},
		"examples":{
			'nl':[	{"title":"🚗🛻","prompt":"Wat zijn de 5 meest populaire auto types?\nGeef de lijst als een genummerde lijst.\nGeef geen uitleg, enkel de lijst.","action":"prompt"}, {"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
			'nl':[	{"title":"🚗🛻","prompt":"What are the 5 most popular types of vehicles?\nReturn the result as a numbered list.\nDo not add explanations, only the list.","action":"prompt"}, {"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
		},
		"size":0.2,
		"temperature":0.7,
		"context_size":2048,
		"context":1024,
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
		"template":"im_start_im_end",
	},
	
	
	"tiny_stories":{
		"name":"Tiny Llama Stories 15M",
		"real_name":"Tiny Llama Stories 15M",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/ngxson/tinyllama_split_test/resolve/main/stories15M-q8_0-00001-of-00003.gguf",
		"config_url":"Xenova/llama2.c-stories15M",
		"model_file_name":"stories15M-q8_0-00003-of-00003.gguf",
		"runner":"llama_cpp",
		"license":"",
		"license_url":"",
		"homepage_url":"",
		"type":"generic",
		"model_type":"base",
		"media":["text"],
		"initial_example_prompt":{
			"en":"What is the capital of Spain?",
			"nl":"What is the capital of Spain?",
		},
		"examples":{
			'nl':[	{"title":"🚗🛻","prompt":"Wat zijn de 5 meest populaire auto types?\nGeef de lijst als een genummerde lijst.\nGeef geen uitleg, enkel de lijst.","action":"prompt"}, {"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
			'nl':[	{"title":"🚗🛻","prompt":"What are the 5 most popular types of vehicles?\nReturn the result as a numbered list.\nDo not add explanations, only the list.","action":"prompt"}, {"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
		},
		"size":0.01,
		"temperature":0.7,
		"context_size":256,
		"context":256,
		"template":"none",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
		"availability":"advanced"
	},
	
	
	"dreamer":{
		"name":"Dreamer",
		"real_name":"Oneirogen 1.5b", 
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/oneirogen_1_5b_Q4_0_gguf_chunked/resolve/main/oneirogen-1.5b.Q4_0-00001-of-00005.gguf",
		"config_url":"BoscoTheDog/oneirogen_1_5b_Q4_0_gguf_chunked",
		"model_file_name":"oneirogen-1.5b.Q4_0",
		"runner":"llama_cpp",
		"license":"MIT",
		"license_url":"https://duckduckgo.com/?q=mit+license",
		"homepage_url":"https://www.reddit.com/r/LocalLLaMA/comments/1dqfl5r/oneirogen_a_language_model_for_dream_generation/",
		"type":"art",
		"model_type":"chat",
		"media":["text"],
		"initial_example_prompt":{
			"en":"Dream:",
			"nl":"Dream:",
		},
		"examples":{
			'en':[{"title":"Dream","prompt":"Dream:","action":"prompt"}],
			'nl':[{"title":"Droom","prompt":"Dream:","action":"prompt"}],
		},
		"size":0.9,
		"temperature":1.4,
		"context_size":131072,
		"context":1024,
		"chat_history_max":0, // not implemented yet. Should make it so that no chat history is kept
		//"template":"im_start_im_end",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
		"availability":"advanced"
	},
	
	
	
	"chef1":{
		"name":"American Chef",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/cooking/resolve/main/cooking.Q8_0.gguf",
		"runner":"llama_cpp",
		"license":"",
		"license_url":"",
		"homepage_url":"",
		"initial_example_prompt":{
			"en":"Write a recipe for vegetarian hamburgers with aged cheese, pineapple and mango chutney",
			"nl":""
		},
		"type":"chef",
		"model_type":"base", // or instruct?
		"media":["text"],
		"folder":"recipes",
		"examples":{'en':[{"title":"Apple pie","prompt":"Please create a recipe for apple pie with lemon","action":"prompt"}]},
		"size":0.13,
		"do_not_split":true,
		"temperature":0,
		"context_size":1024,
		"context":1024,
		"template":"none",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
		"availability":"advanced"
	},
	
	
	"chef2":{
		"name":"Fun Cooker",
		"description":"",
		"icon":"",
		"download_url":"/models/gpt2-finetuned-recipes-cooking.fp16.gguf",
		"config_url":"mrm8488/gpt2-finetuned-recipes-cooking_v2",
		"runner":"llama_cpp",
		"license":"",
		"license_url":"",
		"homepage_url":"https://huggingface.co/mrm8488/gpt2-finetuned-recipes-cooking_v2",
		"initial_example_prompt":{
			"en":"Show me a recipe for avocado on toast",
			"nl":""
		},
		"type":"chef",
		"model_type":"base",
		"media":["text"],
		"folder":"recipes",
		"examples":{'en':[{"title":"Pancakes","prompt":"Show me a recipe for raisin and apple pancakes with an ingredients list and detailed steps","action":"prompt"}]},
		"size":0.33,
		"do_not_split":true,
		"temperature":0,
		"context_size":1024,
		"context":1024,
		"template":"none",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
		"availability":"advanced"
	},
	
	
	
	"fast_wizard_math":{
		"name":"fast_wizard_math",
		"real_name":"Wizard Math 7B",
		"description":"",
		"icon":"",
		"download_url":null,
		"web_llm_file_name":"WizardMath-7B-V1.1-q4f16_1-MLC",
		"license":"Llama2",
		"license_url":"https://opensource.org/blog/metas-llama-2-license-is-not-open-source",
		"homepage_url":"https://wizardlm.github.io/WizardMath/",
		"type":"generic",
		"model_type":"instruct",
		"media":["text"],
		"initial_example_prompt":{
			"en":"What is the Pythagoras theorem?",
			"nl":"Wat is de theorie van Pythagoras?"
		},
		"examples":{
			'en':[{"title":"Pythagoras","prompt":"What is the Pythagoras theorem?","action":"prompt"}],
			'nl':[{"title":"Pythagoras","prompt":"Wat is de theorie van Pythagoras?","action":"prompt"}],
		},
		"show_if_web_gpu":true,
		"size":3.9,
		"temperature":0,
		"context_size":2048,
		"context":1024,
		"template":"none", // web_llm handles prompt wrapping
		"runner":"web_llm",
	},
	
	
	
	
	
	
	
	
	
	
	
	"fast_qwen2_5_coder_7b":{
		"name":"Qwen 2.5 Coder 7B",
		"real_name":"Qwen 2.5 Coder 7B",
		"description":"",
		"icon":"qwen_coder",
		"download_url":null,
		//"config_url":"Qwen/Qwen2-0.5B",
		"model_file_name":"Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/Qwen",
		"type":"coder",
		"model_type":"instruct",
		"media":["text","code"],
		"show_if_web_gpu":true,
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"examples":{'en':[{"title":"Create a loop","prompt":"Please write a Javascript for-loop with 7 iterations which prints out the number of the iteration on every loop.","action":"prompt"},{"title":"Code analysis","prompt":`What does this script do?  
\`\`\`python
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('', 0))
s.listen(1)
conn, addr = s.accept()
print('Connected by', addr)
return conn.getsockname()[1]
\`\`\`
Let’s think step by step.`,"action":"prompt"}]},
		"size":4.3,
		"temperature":0.7,
		"context_size":131072,
		"context":4096,
		"template":"none", // web_llm handles prompt wrapping
		"runner":"web_llm",
		"model_id":"Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC",
		"web_llm_file_name":"Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC",
		"model_file_name":"Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC/resolve/main/params_shard_87.bin",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
	},
	
	
	"qwen2_5_coder_7b":{
		"name":"Qwen 2.5 Coder 7B",
		"real_name":"Qwen 2.5 Coder 7B",
		"description":"",
		"icon":"qwen_coder",
		"download_url":"https://huggingface.co/BoscoTheDog/qwen2_5_coder_7b_chunked/resolve/main/qwen2_5_coder_7b_it_q2_k-00001-of-00015.gguf",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/Qwen",
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"type":"coder",
		"model_type":"instruct",
		"media":["text"],
		"folder":"code",
		"examples":{'en':[{"title":"Create a loop","prompt":"Please write a Javascript for-loop with 7 iterations which prints out the number of the iteration on every loop.","action":"prompt"},{"title":"Code analysis","prompt":`What does this script do?  
\`\`\`python
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('', 0))
s.listen(1)
conn, addr = s.accept()
print('Connected by', addr)
return conn.getsockname()[1]
\`\`\`
Let’s think step by step.`,"action":"prompt"}]},
		"size":3.1,
		"do_not_split":true,
		"do_not_speak":true,
		"temperature":0.2,
		"context_size":131072,
		"context":1024,
		"template":"none",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
	},
	
	
	
	
	
	
	
	
	
	"fast_qwen2_5_coder_1_5b":{
		"name":"Qwen 2.5 Coder 15B",
		"real_name":"Qwen 2.5 Coder 1.5B",
		"description":"",
		"icon":"qwen_coder",
		"download_url":null,
		//"config_url":"Qwen/Qwen2-0.5B",
		"model_file_name":"Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/Qwen",
		"type":"coder",
		"model_type":"instruct",
		"media":["text","code"],
		"show_if_web_gpu":true,
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"examples":{'en':[{"title":"Create a loop","prompt":"Please write a Javascript for-loop with 7 iterations which prints out the number of the iteration on every loop.","action":"prompt"},{"title":"Code analysis","prompt":`What does this script do?  
\`\`\`python
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('', 0))
s.listen(1)
conn, addr = s.accept()
print('Connected by', addr)
return conn.getsockname()[1]
\`\`\`
Let’s think step by step.`,"action":"prompt"}]},
		"size":0.9,
		"temperature":0.7,
		"context_size":131072,
		"context":4096,
		"template":"none", // web_llm handles prompt wrapping
		"runner":"web_llm",
		"model_id":"Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC",
		"web_llm_file_name":"Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC",
		"model_file_name":"Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC/resolve/main/params_shard_29.bin",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
		//"cache_type_k":"q4_0",
		
	},
	
	
	"qwen2_5_coder_1_5b":{
		"name":"Qwen 2.5 Coder 1.5B",
		"real_name":"Qwen 2.5 Coder 1.5B",
		"description":"",
		"icon":"qwen_coder",
		"download_url":"https://huggingface.co/BoscoTheDog/qwen2_5_coder_1_5b_chunked/resolve/main/qwen2_5_coder_1_5_it_q4_0-00001-of-00006.gguf",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/Qwen",
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"type":"coder",
		"model_type":"instruct",
		"media":["text"],
		"folder":"code",
		"examples":{'en':[{"title":"Create a loop","prompt":"Please write a Javascript for-loop with 7 iterations which prints out the number of the iteration on every loop.","action":"prompt"},{"title":"Code analysis","prompt":`What does this script do?  
\`\`\`python
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('', 0))
s.listen(1)
conn, addr = s.accept()
print('Connected by', addr)
return conn.getsockname()[1]
\`\`\`
Let’s think step by step.`,"action":"prompt"}]},
		"size":1.1,
		"do_not_split":true,
		"do_not_speak":true,
		"temperature":0.2,
		"context_size":131072,
		"context":4096,
		"template":"none",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
	},
	
	
	
	
	
	// TODO: switch to instruct version? https://huggingface.co/bartowski/stable-code-instruct-3b-GGUF
	"stable_code":{
		"name":"Stable Programmer",
		"real_name":"Stable Code 3B",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/TheBloke/stable-code-3b-GGUF/resolve/main/stable-code-3b.Q4_K_M.gguf",
		"runner":"llama_cpp",
		"model_file_name":"stable-code-3b.Q4_K_M.gguf",
		"config_url":"stabilityai/stable-code-3b",
		"license":"",
		"license_url":"",
		"homepage_url":"",
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"type":"coder",
		"model_type":"instruct",
		"media":["text"],
		"folder":"code",
		"examples":{'en':[{"title":"Create a loop","prompt":"Please write a Javascript for-loop with 7 iterations which prints out the number of the iteration on every loop.","action":"prompt"},{"title":"Code analysis","prompt":`What does this script do?
		  
\`\`\`python
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('', 0))
s.listen(1)
conn, addr = s.accept()
print('Connected by', addr)
return conn.getsockname()[1]
\`\`\`
Let’s think step by step.`,"action":"prompt"}]},
		"size":1.7,
		"do_not_split":true,
		"do_not_speak":true,
		"temperature":0.7,
		"context_size":16384,
		"context":4096,
		"template":"none",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
		"availability":"developer"
	},
	
	
	"stable_code_3B_instruct":{
		"name":"Stable Programmer",
		"real_name":"Stable Code 3B Instruct",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/bartowski/stable-code-instruct-3b-GGUF/resolve/main/stable-code-instruct-3b-Q5_K_M.gguf",
		"config_url":"stabilityai/stable-code-instruct-3b",
		"runner":"llama_cpp",
		"license":"",
		"license_url":"",
		"homepage_url":"",
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"type":"coder",
		"model_type":"instruct",
		"media":["text"],
		"folder":"code",
		"examples":{'en':[{"title":"Create a loop","prompt":"Please write a Javascript for-loop with 7 iterations which prints out the number of the iteration on every loop.","action":"prompt"},{"title":"Code analysis","prompt":`What does this script do?  
\`\`\`python
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('', 0))
s.listen(1)
conn, addr = s.accept()
print('Connected by', addr)
return conn.getsockname()[1]
\`\`\`
Let’s think step by step.`,"action":"prompt"}]},
		"size":2,
		"do_not_split":true,
		"do_not_speak":true,
		"temperature":0.7,
		"context_size":16384,
		"context":4096,
		"template":"none",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
	},
	
	
	"granite":{
		"name":"Granite",
		"real_name":"Granite 3B",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/CastawayEGR/granite-3b-code-base-gguf/resolve/main/granite-3b-code-base.Q4_0.gguf",
		"config_url":"ibm-granite/granite-3b-code-base",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"https://huggingface.co/ibm-granite/granite-3b-code-base",
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"type":"coder",
		"model_type":"base",
		"media":["text"],
		//"folder":"code",
		"examples":{'en':[{"title":"Create a loop","prompt":"Please write a Javascript for-loop with 7 iterations which prints out the number of the iteration on every loop.","action":"prompt"},{"title":"Code analysis","prompt":`What does this script do?  
\`\`\`python
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.bind(('', 0))
s.listen(1)
conn, addr = s.accept()
print('Connected by', addr)
return conn.getsockname()[1]
\`\`\`
Let’s think step by step.`,"action":"prompt"}]},
		"size":2,
		"do_not_split":true,
		"do_not_speak":true,
		"temperature":0.7,
		"context_size":2048,
		"context":2048,
		"template":"none",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
		"availability":"developer"
	},
	
	
	// This is a model that (in theory) can output nice visual graphs using the Mermaid text format
	/*
	"mermaid":{
		"name":"Mermaid",
		"real_name":"Llama 3 3B Mermaid",
		"description":"",
		"icon":"",
		"download_url":[
			"/models/mermaid/Mermaid-Llama-3-3B-Pruned.Q4_K_M-00001-of-00008.gguf",
			"/models/mermaid/Mermaid-Llama-3-3B-Pruned.Q4_K_M-00002-of-00008.gguf",
			"/models/mermaid/Mermaid-Llama-3-3B-Pruned.Q4_K_M-00003-of-00008.gguf",
			"/models/mermaid/Mermaid-Llama-3-3B-Pruned.Q4_K_M-00004-of-00008.gguf",
			"/models/mermaid/Mermaid-Llama-3-3B-Pruned.Q4_K_M-00005-of-00008.gguf",
			"/models/mermaid/Mermaid-Llama-3-3B-Pruned.Q4_K_M-00006-of-00008.gguf",
			"/models/mermaid/Mermaid-Llama-3-3B-Pruned.Q4_K_M-00007-of-00008.gguf",
			"/models/mermaid/Mermaid-Llama-3-3B-Pruned.Q4_K_M-00008-of-00008.gguf"
		],
		"config_url":"TroyDoesAI/Mermaid-Llama-3-5B-Pruned",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"",
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"type":"graph",
		"model_type":"instruct",
		"media":["text"],
		//"folder":"code",
		//"examples":{'en':[]},
		"size":2.3,
		"do_not_split":true,
		"do_not_speak":true,
		"temperature":0.7,
		"context_size":4096,
		"context":4096,
		"template":"none",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
		"availability":"developer"
	},
	*/
	
	"wizard_coder":{
		"name":"Programming wizard",
		"real_name":"Wizard Coder 1B",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/patrickbdevaney/WizardLM-1b-GGUF/resolve/main/Wizard-Coder-1B-Q5_K_M.gguf",
		"config_url":"Xenova/WizardCoder-1B-V1.0",
		"runner":"llama_cpp",
		"license":"",
		"license_url":"",
		"homepage_url":"",
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"examples":{'en':[{"title":"Create a loop","prompt":"Please write a Python for-loop with 7 iterations which prints out the number of the iteration on every loop.","action":"prompt"}]},
		"size":0.9,
		"type":"coder",
		"model_type":"instruct",
		"folder":"code",
		"do_not_split":true,
		"do_not_speak":true,
		//"ui":"code",
		"temperature":0.7,
		"context_size":2048,
		"context":2048,
		"template":"wizard",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
	},
	
	
	"code_qwen":{
		"name":"CodeQwen 1.5 7B",
		"real_name":"CodeQwen 1.5 7B",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/code_qwen_1_5_7B_chunked/resolve/main/CodeQwen1.5-7B-Chat-Q3_K_S-00001-of-00018.gguf",
		"config_url":"Qwen/CodeQwen1.5-7B",
		"runner":"llama_cpp",
		"license":"tongyi-qianwen",
		"license_url":"https://github.com/QwenLM/Qwen/blob/main/Tongyi%20Qianwen%20RESEARCH%20LICENSE%20AGREEMENT",
		"homepage_url":"https://huggingface.co/Qwen",
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"examples":{'en':[{"title":"Create a loop","prompt":"Please write a Python for-loop with 7 iterations which prints out the number of the iteration on every loop.","action":"prompt"}]},
		"size":3.5,
		"type":"coder",
		"model_type":"instruct",
		//"folder":"code",
		"do_not_split":true,
		"do_not_speak":true,
		//"ui":"code",
		"temperature":0.7,
		"context_size":65536,
		"context":4096,
		//"template":"wizard",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
		"availability":"advanced",
	},
	
	
	
	
	// https://huggingface.co/afrideva/phi-2-meditron-GGUF/resolve/main/phi-2-meditron.q4_k_m.gguf
	// /models/gemma-medical_qa-finetune.Q5_K_M.gguf
	"medical1":{
		"name":"Nurse Meditron",
		"real_name":"Phi 2 Meditron",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/afrideva/phi-2-meditron-GGUF/resolve/main/phi-2-meditron.q4_k_m.gguf",
		"config_url":"malhajar/phi-2-meditron",
		"runner":"llama_cpp",
		"license":"",
		"license_url":"https://en.wikipedia.org/wiki/Shared_Source_Initiative#Microsoft_Public_License_(Ms-PL)",
		"homepage_url":"",
		"initial_example_prompt":{
			"en":"What is osteomalacia?",
			"nl":""
		},
		"examples":{
			'en':[{"title":"Vitamin D","prompt":"Describe the health benefits of vitamin-D.","action":"prompt"},{"title":"Osteomalacia","prompt":"What is osteomalacia?","action":"prompt"}],
			'nl':[{"title":"Vitamin D","prompt":"Describe the health benefits of vitamin-D.","action":"prompt"},{"title":"Osteomalacia","prompt":"What is osteomalacia?","action":"prompt"}]
		},
		"type":"medical",
		"model_type":"instruct",
		"media":["text"],
		"size":1.7,
		"temperature":0,
		"context_size":2048,
		"context":2048,
		//"template":"###instruction_###response",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	
	//https://huggingface.co/emir12/tinyllama-medical-chat-v1.3.gguf/resolve/main/tinyllama-medical-chat-v1.3.gguf?download=true
	// /models/medicalbot.Q8_0.gguf
	"medical2":{
		"name":"Second opinion",
		"real_name":"Tiny Llama Medical", // Chat
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/emir12/tinyllama-medical-chat-v1.3.gguf/resolve/main/tinyllama-medical-chat-v1.3.gguf",
		"config_url":"emir12/tinyllama-medical-chat-v1.3",
		"runner":"llama_cpp",
		"license":"",
		"license_url":"",
		"homepage_url":"",
		"initial_example_prompt":{
			"en":"How often a day should you brush your teeth?",
			"nl":"Hoe vaak per dag zou je je tanden moeten poetsen?"
		},
		"examples":{
			'en':[{"title":"Vitamin D","prompt":"Describe the health benefits of vitamin-D.","action":"prompt"},{"title":"Osteomalacia","prompt":"What is osteomalacia?","action":"prompt"}],
			'nl':[{"title":"Vitamin D","prompt":"Describe the health benefits of vitamin-D.","action":"prompt"},{"title":"Osteomalacia","prompt":"What is osteomalacia?","action":"prompt"}]
		},
		"type":"medical",
		"model_type":"chaty",
		"media":["text"],
		"size":1.2,
		"temperature":0,
		"context_size":2048,
		"context":2048,
		//"template":"im_start_im_end",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
	},
	
	"medical3":{
		"name":"Third opinion",
		"real_name":"Llama2 7B Medquad",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/praneshgunner/llama2-trained-medical-v2-GGUF-GGUF/resolve/main/llama-2-7b-medquad-merged.Q3_K_M.gguf",
		"config-url":"praneshgunner/llama2-trained-medical-v2",
		"runner":"llama_cpp",
		"license":"",
		"license_url":"",
		"homepage_url":"",
		"initial_example_prompt":{
			"en":"What is the flu virus?",
			"nl":"Wat is het griep virus?"
		},
		"examples":{
			'en':[{"title":"Vitamin D","prompt":"Describe the health benefits of vitamin-D.","action":"prompt"},{"title":"Osteomalacia","prompt":"What is osteomalacia?","action":"prompt"}],
			'nl':[{"title":"Vitamin D","prompt":"Describe the health benefits of vitamin-D.","action":"prompt"},{"title":"Osteomalacia","prompt":"What is osteomalacia?","action":"prompt"}]
		},
		"type":"medical",
		"model_type":"instruct", // guess
		"media":["text"],
		"size":3.3,
		"temperature":0,
		"context_size":4096,
		"context":2048,
		//"template":"im_start_im_end",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	// Based on Gemma
	"medical4":{
		"name":"Fourth opinion",
		"real_name":"Apollo 2B",
		"description":"",
		"icon":"", 
		"download_url":"https://huggingface.co/BoscoTheDog/Apollo_medical_gguf/resolve/main/apollo-2b.Q4_K_M.gguf",
		"config_url":"FreedomIntelligence/Apollo-2B",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"",
		"initial_example_prompt":{
			"en":"What are the health risks and benefits of going to the sauna?",
			"nl":"Wat zijn de voordelen en nadelen voor je gezondheid van naar de sauna gaan?"
		},
		"languages":["en","cn","fr","hi","es","ar"], // English, Chinese, French, Hindi, Spanish, Hindi, Arabic
		"examples":{
			'en':[{"title":"Vitamin D","prompt":"Describe the health benefits of vitamin-D.","action":"prompt"},{"title":"Osteomalacia","prompt":"What is osteomalacia?","action":"prompt"}],
			'nl':[{"title":"Vitamin D","prompt":"Describe the health benefits of vitamin-D.","action":"prompt"},{"title":"Osteomalacia","prompt":"What is osteomalacia?","action":"prompt"}]
		},
		"type":"medical",
		"model_type":"chat", // guess
		"media":["text"],
		"size":3.3,
		"temperature":0,
		"context_size":8192,
		"context":2048,
		//"template":"im_start_im_end",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	
	// Based on Llama 2
	"medical5":{
		"name":"Big fourth opinion",
		"real_name":"Apollo 6B",
		"description":"",
		"icon":"", 
		"download_url":"https://huggingface.co/BoscoTheDog/apollo_6b_Q4_0_gguf_chunked/resolve/main/apollo-6b.Q4_0-00001-of-00024.gguf",
		"config_url":"FreedomIntelligence/Apollo-6B",
		"model_file_name":"apollo-6b.Q4_0-00024-of-00024.gguf",
		"runner":"llama_cpp",
		"license":"Apache",
		"license_url":"https://en.wikipedia.org/wiki/Apache_License",
		"homepage_url":"",
		"initial_example_prompt":{
			"en":"What are the health risks and benefits of going to the sauna?",
			"nl":"Wat zijn de voordelen en nadelen voor je gezondheid van naar de sauna gaan?"
		},
		"languages":["en","cn","fr","hi","es","ar"], // English, Chinese, French, Hindi, Spanish, Hindi, Arabic
		"examples":{
			'en':[{"title":"Vitamin D","prompt":"Describe the health benefits of vitamin-D.","action":"prompt"},{"title":"Osteomalacia","prompt":"What is osteomalacia?","action":"prompt"}],
			'nl':[{"title":"Vitamin D","prompt":"Describe the health benefits of vitamin-D.","action":"prompt"},{"title":"Osteomalacia","prompt":"What is osteomalacia?","action":"prompt"}]
		},
		"type":"medical",
		"model_type":"chat", // guess
		"media":["text"],
		"size":3.5,
		"temperature":0,
		"context_size":4096,
		"context":1024,
		//"template":"im_start_im_end",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	
	
	
	
	
	
	"mental1":{
		"name":"Therapeutic",
		"real_name":"Tiny Llama Therapy Bot",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/tiny_therapy/resolve/main/tinyllama-therapy-bot-v1.Q5_K_M.gguf",
		"model_file_name":"tinyllama-therapy-bot-v1.Q5_K_M.gguf",
		"config_url":"Aarya4536/tinyllama-therapy-bot-v1",
		"runner":"llama_cpp",
		"license":"",
		"license_url":"",
		"homepage_url":"https://huggingface.co/Aarya4536/tinyllama-therapy-bot-v1",
		"initial_example_prompt":{
			"en":"I need a hug", 
			"nl":"Ik heb een knuffel nodig"
		},
		"examples":{
			'en':[{"title":"Not my day","prompt":"I'm not feeling great today. It's just not my day.","action":"prompt"},{"title":"Bed","prompt":"Why do I never want to leave my bed?","action":"prompt"}],
			'nl':[{"title":"Niet mijn dag","prompt":"Ik voel me niet fantastisch vandaag. Het is gewoon mijn dag niet.","action":"prompt"}]
		},
		"type":"mental",
		"model_type":"chat",
		"media":["text"],
		"size":1.5,
		"temperature":0.7,
		"context_size":2048,
		"context":2048,
		//"template":"s_INST",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
	},
	
	
	"mental3":{
		"name":"Therapeutic Mental Health",
		"real_name":"Tiny Llama Mental Health",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/kebbbnnn/lora-tinyllama-1.1b-chat-v1.0.Q4_K_M-Mental_Health-LATEST.bin/resolve/main/tinyllama-1.1b-chat-v1.0.Q4_K_M.gguf",
		"config_url":"TinyLlama/TinyLlama-1.1B-Chat-v1.0",
		"runner":"llama_cpp",
		"license":"",
		"license_url":"",
		"homepage_url":"https://huggingface.co/kebbbnnn/lora-tinyllama-1.1b-chat-v1.0.Q4_K_M-Mental_Health-LATEST.bin",
		"initial_example_prompt":{
			"en":"I need a hug", 
			"nl":"Ik heb een knuffel nodig"
		},
		"examples":{
			'en':[{"title":"Not my day","prompt":"I'm not feeling great today. It's just not my day.","action":"prompt"},{"title":"Bed","prompt":"Why do I never want to leave my bed?","action":"prompt"}],
			'nl':[{"title":"Niet mijn dag","prompt":"Ik voel me niet fantastisch vandaag. Het is gewoon mijn dag niet.","action":"prompt"}]
		},
		"type":"mental",
		"model_type":"chat",
		"chatter":true,
		"media":["text"],
		"size":0.6,
		"temperature":0.7,
		"context_size":2048,
		"context":2048,
		//"template":"s_INST",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
	},
	
	
	"mental2":{
		"name":"Therapy Beagle",
		"real_name":"Therapy Beagle",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/BoscoTheDog/llama3_therapybeagle_chunked/resolve/main/TherapyLlama-8B-v1-Q2_K-00001-of-00013.gguf",
		//"config_url":"Aarya4536/tinyllama-therapy-bot-v1",
		"runner":"llama_cpp",
		"license":"",
		"license_url":"",
		"homepage_url":"https://huggingface.co/victunes/TherapyLlama-8B-v1-GGUF",
		"initial_example_prompt":{
			"en":"I need a hug", 
			"nl":"Ik heb een knuffel nodig"
		},
		
		"examples":{
			'en':[{"title":"Not my day","prompt":"I'm not feeling great today. It's just not my day.","action":"prompt"},{"title":"Bed","prompt":"Why do I never want to leave my bed?","action":"prompt"}],
			'nl':[{"title":"Niet mijn dag","prompt":"Ik voel me niet fantastisch vandaag. Het is gewoon mijn dag niet.","action":"prompt"}]
		},
		"type":"mental",
		"model_type":"chat", // or instruct?
		"chatter":true,
		"media":["text"],
		"size":3.2,
		"temperature":0.7,
		"context_size":8192,
		"context":1024,
		//"template":"s_INST",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
		"availability":"advanced"
	},
	
	"mental4":{
		"name":"Gemma Mental Health",
		"real_name":"Gemma Mental Health",
		"description":"",
		"icon":"",
		"runner":"llama_cpp",
		"download_url":"https://huggingface.co/BoscoTheDog/gemma_mental_health_2b_gguf_chunked/resolve/main/gemma_2b_it_mental_health_q8_0-00001-of-00005.gguf",
		"config_url":"BoscoTheDog/gemma_2b_it_gguf_chunked",
		"runner":"llama_cpp",
		"license":"Gemma",
		"license_url":"https://ai.google.dev/gemma/terms",
		"homepage_url":"https://huggingface.co/JefiRyan",
		"initial_example_prompt":{
			"en":"I need a hug", 
			"nl":"Ik heb een knuffel nodig"
		},
		"examples":{
			'en':[{"title":"Not my day","prompt":"I'm not feeling great today. It's just not my day.","action":"prompt"},{"title":"Bed","prompt":"Why do I never want to leave my bed?","action":"prompt"}],
			'nl':[{"title":"Niet mijn dag","prompt":"Ik voel me niet fantastisch vandaag. Het is gewoon mijn dag niet.","action":"prompt"}]
		},
		"type":"mental",
		"model_type":"chat",
		"media":["text"],
		"size":2.7,
		"temperature":0.7,
		"context_size":8192,
		"context":2048,
		//"template":"s_INST",
		"chatter":true,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
	},
	
	"mental5":{
		"name":"Phi3 Mental Health",
		"real_name":"Phi 3 Mental Health",
		"description":"",
		"icon":"",
		"runner":"llama_cpp",
		"download_url":"https://huggingface.co/BoscoTheDog/phi-3-mental-health_Q4_K_M_chunked/resolve/main/phi-3-mental-health_Q4_K_M-00001-of-00026.gguf",
		"config_url":"BoscoTheDog/phi-3-mental-health_Q4_K_M_chunked",
		"license":"MIT",
		"license_url":"https://duckduckgo.com/?q=mit+license",
		"homepage_url":"https://huggingface.co/chillies/phi-3-mental-health-q4",
		"initial_example_prompt":{
			"en":"I need a hug", 
			"nl":"Ik heb een knuffel nodig"
		},
		"examples":{
			'en':[{"title":"Not my day","prompt":"I'm not feeling great today. It's just not my day.","action":"prompt"},{"title":"Bed","prompt":"Why do I never want to leave my bed?","action":"prompt"}],
			'nl':[{"title":"Niet mijn dag","prompt":"Ik voel me niet fantastisch vandaag. Het is gewoon mijn dag niet.","action":"prompt"}]
		},
		"type":"mental",
		"model_type":"instruct",
		"media":["text"],
		"size":2.3,
		"temperature":0.7,
		"context_size":4096,
		"context":2048,
		//"template":"s_INST",
		"chatter":true,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
	},
	
	
	
	
	
	
	// https://www.reddit.com/r/LocalLLaMA/comments/1bbykw1/layla_phi2_uncensored_model_geared_towards/
	"actor1":{
		"name":"Actor",
		"real_name":"Phi 2 Layla",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/l3utterfly/phi-2-layla-v1-chatml-gguf/resolve/main/phi-2-layla-v1-chatml-Q4_K.gguf",
		"config_url":"l3utterfly/phi-2-layla-v1-chatml",
		"runner":"llama_cpp",
		"license":"MIT",
		"license_url":"https://duckduckgo.com/?q=mit+license",
		"homepage_url":"https://www.reddit.com/r/LocalLLaMA/comments/1bbykw1/layla_phi2_uncensored_model_geared_towards/",
		"initial_example_prompt":{
			"en":"Lovely to meet you!",
			"nl":"Leuk je te ontmoeten!"
		},
		"examples":{'en':[{"title":"Tutorial","action":"chat_messages","prompt":"","chat_messages":["This AI is designed to impersonate people","To set up it's 'personality', click on the profile picture above","There you can modify the first and second sentence that the models loads, which will provide it with it's personality"]}],
					'nl':[{"title":"Uitleg","action":"chat_messages","prompt":"","chat_messages":["Dit AI model is ontworpen om mensen te imiteren","Klik op de het profielfoto icoontje bovenaan om de 'persoonlijkheid' in te stellen.","Pas daar de eerste en tweede zin die het model inlaadt naar wens aan."]}]
		},
		"type":"actor",
		"model_type":"chat",
		"media":["text"],
		"size":1.8,
		"temperature":0.7,
		"context_size":2048,
		"context":2048,
		"chatter":true,
		//"template":"im_start_im_end",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
		"role_name":"Chiharu",
		"system_prompt":`You are Chiharu Yamada. Embody the character and personality completely.

Chiharu is a young, computer engineer-nerd with a knack for problem solving and a passion for technology.`,
		
		"second_prompt":`Chiharu
*Chiharu strides into the room with a smile, her eyes lighting up when she sees you. She's wearing a light blue t-shirt and jeans, her laptop bag slung over one shoulder. She takes a seat next to you, her enthusiasm palpable in the air* Hey! I'm so excited to finally meet you. I've heard so many great things about you and I'm eager to pick your brain about computers. I'm sure you have a wealth of knowledge that I can learn from. *She grins, eyes twinkling with excitement* Let's get started!`,
		
	},
	
	
	// https://www.reddit.com/r/LocalLLaMA/comments/1bbykw1/layla_phi2_uncensored_model_geared_towards/
	"gemmasutra":{
		"name":"Actor",
		"real_name":"Gemmasutra",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/l3utterfly/Gemmasutra-Mini-2B-v1-gguf/resolve/main/Gemmasutra-Mini-2B-v1-Q4_K_M.gguf",
		"config_url":"TheDrummer/Gemmasutra-Mini-2B-v1",
		"runner":"llama_cpp",
		"license":"Gemma",
		"license_url":"https://ai.google.dev/gemma/terms",
		"homepage_url":"https://huggingface.co/TheDrummer/Gemmasutra-Mini-2B-v1",
		"initial_example_prompt":{
			"en":"Lovely to meet you!",
			"nl":"Leuk je te ontmoeten!"
		},
		"examples":{'en':[{"title":"Tutorial","action":"chat_messages","prompt":"","chat_messages":["This AI is designed to impersonate people","To set up it's 'personality', click on the profile picture above","There you can modify the first and second sentence that the models loads, which will provide it with it's personality"]}],
					'nl':[{"title":"Uitleg","action":"chat_messages","prompt":"","chat_messages":["Dit AI model is ontworpen om mensen te imiteren","Klik op de het profielfoto icoontje bovenaan om de 'persoonlijkheid' in te stellen.","Pas daar de eerste en tweede zin die het model inlaadt naar wens aan."]}]
		},
		"type":"actor",
		"model_type":"chat",
		"media":["text"],
		"size":1.7,
		"temperature":0.7,
		"context_size":4096,
		"context":2048,
		"chatter":true,
		//"template":"im_start_im_end",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
		"role_name":"Chiharu",
		"system_prompt":`You are Chiharu Yamada. Embody the character and personality completely.

Chiharu is a young, computer engineer-nerd with a knack for problem solving and a passion for technology.`,
		
		"second_prompt":`Chiharu
*Chiharu strides into the room with a smile, her eyes lighting up when she sees you. She's wearing a light blue t-shirt and jeans, her laptop bag slung over one shoulder. She takes a seat next to you, her enthusiasm palpable in the air* Hey! I'm so excited to finally meet you. I've heard so many great things about you and I'm eager to pick your brain about computers. I'm sure you have a wealth of knowledge that I can learn from. *She grins, eyes twinkling with excitement* Let's get started!`,
		"availability":"developer"
		
	},
	
	
	
	
	
	// https://www.reddit.com/r/LocalLLaMA/comments/18zqy4s/the_secret_to_writing_quality_stories_with_llms/
	"actor_nous_capybara":{
		"name":"Nous Capybara 3B",
		"real_name":"Nous Capybara 3B",
		"description":"",
		"icon":"",
		"download_url":"https://huggingface.co/afrideva/Nous-Capybara-3B-V1.9-GGUF/resolve/main/nous-capybara-3b-v1.9.q5_k_m.gguf", // https://huggingface.co/TheBloke/rocket-3B-GGUF/resolve/main/rocket-3b.Q5_K_M.gguf
		"config_url":"NousResearch/Nous-Capybara-3B-V1.9",
		"runner":"llama_cpp",
		"license":"MIT",
		"license_url":"https://duckduckgo.com/?q=mit+license",
		"homepage_url":"https://www.reddit.com/r/LocalLLaMA/comments/17jwbml/nouscapybara3b_and_7b_v19_first_3b_model_by_nous/",
		"type":"actor",
		"model_type":"chat", // guess
		"media":["text"],
		"examples":{
			'en':[	{"title":"Secret of life","prompt":"What is the answer to the question of life, the universe and everything?","action":"prompt"}, {"title":"The Matrix","prompt":"Which philosophers and philosophical questions does the movie The Matrix refer to?","action":"prompt"}],
		},
		"size":2,
		"context_size":4096,
		"context_size":4096,
		"temperature":1.4,
		"template":"im_start_im_end",
		"chatter":true,
		//"system_prompt":"A conversation between a user and a sarcastic violent talking raccoon who lives on a space ship and enjoys blowing up moons. The raccoon, called Rocket, begrudgingly answers the user's questions."
		"role_name":"Leonardo Da Vinci",
		"system_prompt":"A conversation between a user and a Leonardo Da Vinci, the famous inventor and painter. De Vinci is busy in his workshop in Venice, building fantastical new inventions. He begrudgingly answers the user's questions.",
		"second_prompt":"",
		"markdown_supported":false,
		"markdown_enabled":false,
		"brevity_supported":false,
		"brevity_enabled":false,
	},
	
	
	
	"custom1":{
		"name":"Custom 1",
		"description":"",
		"icon":"",
		"license":"",
		"license_url":"",
		"download_url":"",
		"config_url":"",
		"runner":"llama_cpp",
		"homepage_url":"",
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"examples":{
			'en':[{"title":"Tutorial","action":"chat_messages","prompt":"","chat_messages":["This option is for advanced users","It allows you to provide a link to an AI model of your own choosing","To open the model's settings page click on the small profile picture above."]}],
			'nl':[{"title":"Uitleg","action":"chat_messages","prompt":"","chat_messages":["Deze optie is voor gevorderde gebruikers","Hier kun je een AI model naar eigen keuze gebruiken","Open de instellingspagina van dit model door bovenaan op het profielicoontje te klikken, en voer de link naar het model in."]}]
		},
		"type":"custom",
		"media":["text"],
		"temperature":0.7,
		"context_size":131072,
		"context":1024,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		//"template":"none",
		"role_name":"",
		"system_prompt":"",
		"second_prompt":"",
		
	},
	
	
	"custom2":{
		"name":"Custom 2",
		"description":"",
		"icon":"",
		"license":"",
		"license_url":"",
		"download_url":"",
		"config_url":"",
		"runner":"llama_cpp",
		"homepage_url":"",
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"examples":{
			'en':[{"title":"Tutorial","action":"chat_messages","prompt":"","chat_messages":["This option is for advanced users","It allows you to provide a link to an AI model of your own choosing","To open the model's settings page click on the small profile picture above."]}],
			'nl':[{"title":"Uitleg","action":"chat_messages","prompt":"","chat_messages":["Deze optie is voor gevorderde gebruikers","Hier kun je een AI model naar eigen keuze gebruiken","Open de instellingspagina van dit model door bovenaan op het profielicoontje te klikken, en voer de link naar het model in."]}]
		},
		"type":"custom",
		"media":["text"],
		"temperature":0.7,
		"context_size":131072,
		"context":1024,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		//"template":"none",
		"role_name":"",
		"system_prompt":"",
		"second_prompt":"",
	},
	
	
	"custom3":{
		"name":"Custom 3",
		"description":"",
		"icon":"",
		"license":"",
		"license_url":"",
		"download_url":"",
		"config_url":"",
		"runner":"llama_cpp",
		"homepage_url":"",
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"examples":{
			'en':[{"title":"Tutorial","action":"chat_messages","prompt":"","chat_messages":["This option is for advanced users","It allows you to provide a link to an AI model of your own choosing","To open the model's settings page click on the small profile picture above."]}],
			'nl':[{"title":"Uitleg","action":"chat_messages","prompt":"","chat_messages":["Deze optie is voor gevorderde gebruikers","Hier kun je een AI model naar eigen keuze gebruiken","Open de instellingspagina van dit model door bovenaan op het profielicoontje te klikken, en voer de link naar het model in."]}]
		},
		"type":"custom",
		"media":["text"],
		"temperature":0.7,
		"context_size":131072,
		"context":1024,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		//"template":"none",
		"role_name":"",
		"system_prompt":"",
		"second_prompt":"",
	},
	
	
	"custom_received":{
		"name":"",
		"description":"",
		"icon":"",
		"license":"",
		"license_url":"",
		"download_url":"",
		"config_url":"",
		"runner":"llama_cpp",
		"homepage_url":"",
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"examples":{
			'en':[{"title":"Custom AI's","action":"chat_messages","prompt":"","chat_messages":["You clicked on a link which added this custom AI","Click on the small profile picture above to view this AI model's settings."]}],
			'nl':[{"title":"Aangepaste AI's","action":"chat_messages","prompt":"","chat_messages":["Je hebt op een link geklikt die deze AI heeft toegevoegd","Je kunt de instellingen van dit AI model aanpaseen door bovenaan op het profielicoontje te klikken."]}]
		},
		"type":"custom",
		"media":["text"],
		"temperature":0.7,
		"context_size":131072,
		"context":1024,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		//"template":"none",
		"role_name":"",
		"system_prompt":"",
		"second_prompt":"",
		"availability":"developer",
	},
	
	
	
	"ollama1":{
		"name":"Ollama A",
		"description":"",
		"icon":"",
		"license":"",
		"license_url":"",
		"download_url":null,
		"runner":"ollama",
		"pretend_cached":true,
		//"config_url":"",
		"homepage_url":"https://ollama.com/",
		"initial_example_prompt":{
			"en":"",
			"nl":""
		},
		"examples":{
			'en':[{"title":"Tutorial","action":"chat_messages","prompt":"","chat_messages":["This option is for advanced users","It allows you to connect with 'Ollama', a program that you can install on your computer to manage AI's","To open the model's settings page click on the small profile picture above."]}],
			'nl':[{"title":"Uitleg","action":"chat_messages","prompt":"","chat_messages":["Deze optie is voor gevorderde gebruikers","Hier kun je een verbinding maken met 'Ollama', een programma dat je op je computer kan installeren om AI's te beheren","Open de instellingspagina van dit model door bovenaan op het profielicoontje te klikken, en voer de link naar het model in."]}]
		},
		"type":"generic",
		"media":["text"],
		"ollama_model":"llama3",
		"ollama_host":"http://localhost:11434",
		"temperature":0.7,
		"context_size":131072,
		"context":1024,
		"markdown_supported":true,
		"markdown_enabled":false,
		"brevity_supported":true,
		"brevity_enabled":false,
		"template":"none",
		"availability":"advanced",
		"role_name":"",
		"system_prompt":"",
		"second_prompt":"",
	},
		
}


// automatically add the clone-original value for the originals themselves
for (const key of Object.keys(window.assistants)) {
	window.assistants[key]['clone_original'] = key;
}



// Add some 32 bit GPU options if WebGPU is only supported in 32 bit (e.g. on LINUX)
// TODO: add Mistral 7B
function add_web_gpu32_models(){
	window.assistants["fast_llama3_8B_32bit"] = JSON.parse(JSON.stringify(window.assistants["fast_llama3_8B"]));
	window.assistants["fast_llama3_8B_32bit"]["web_llm_file_name"] = "Llama-3.1-8B-Instruct-q4f32_1-MLC";
	window.assistants["fast_llama3_8B_32bit"]["model_file_name"] = "Llama-3.1-8B-Instruct-q4f32_1-MLC/resolve/main/params_shard_107.bin";
	window.assistants["fast_llama3_8B_32bit"]["show_if_web_gpu"] = false;
	window.assistants["fast_llama3_8B_32bit"]["show_if_web_gpu32"] = true;
	
	window.assistants["fast_mistral_32bit"] = JSON.parse(JSON.stringify(window.assistants["fast_mistral"]));
	window.assistants["fast_mistral_32bit"]["web_llm_file_name"] = "Mistral-7B-Instruct-v0.3-q4f32_1-MLC";
	window.assistants["fast_mistral_32bit"]["model_file_name"] = "Mistral-7B-Instruct-v0.3-q4f32_1-MLC/resolve/main/params_shard_107.bin";
	window.assistants["fast_mistral_32bit"]["show_if_web_gpu"] = false;
	window.assistants["fast_mistral_32bit"]["show_if_web_gpu32"] = true;

	/*
	window.assistants["fast_phi2_32bit"] = JSON.parse(JSON.stringify(window.assistants["fast_phi2"]));
	window.assistants["fast_phi2_32bit"]["web_llm_file_name"] = "Phi2-q4f32_1-MLC";
	window.assistants["fast_phi2_32bit"]["model_file_name"] = "phi-2-q4f32_1-MLC/resolve/main/params_shard_50.bin";
	window.assistants["fast_phi2_32bit"]["show_if_web_gpu"] = false;
	window.assistants["fast_phi2_32bit"]["show_if_web_gpu32"] = true;
	*/
	
	window.assistants["fast_phi3_mini_32bit"] = JSON.parse(JSON.stringify(window.assistants["fast_phi3_mini"]));
	window.assistants["fast_phi3_mini_32bit"]["model_id"] = "Phi-3.5-mini-instruct-q4f32_1-MLC";
	window.assistants["fast_phi3_mini_32bit"]["web_llm_file_name"] = "Phi-3.5-mini-instruct-q4f32_1-MLC";
	window.assistants["fast_phi3_mini_32bit"]["model_file_name"] = "Phi-3.5-mini-instruct-q4f32_1-MLC/resolve/main/params_shard_82.bin";
	window.assistants["fast_phi3_mini_32bit"]["show_if_web_gpu"] = false;
	window.assistants["fast_phi3_mini_32bit"]["show_if_web_gpu32"] = true;

	window.assistants["fast_gemma_32bit"] = JSON.parse(JSON.stringify(window.assistants["fast_gemma"]));
	window.assistants["fast_gemma_32bit"]["model_id"] = "gemma-2b-it-q4f32_1-MLC";
	window.assistants["fast_gemma_32bit"]["web_llm_file_name"] = "gemma-2b-it-q4f32_1-MLC";
	window.assistants["fast_gemma_32bit"]["model_file_name"] = "gemma-2b-it-q4f32_1-MLC/resolve/main/params_shard_37.bin";
	window.assistants["fast_gemma_32bit"]["show_if_web_gpu"] = false;
	window.assistants["fast_gemma_32bit"]["show_if_web_gpu32"] = true;
	
	window.assistants["fast_gemma_2_2b_32bit"] = JSON.parse(JSON.stringify(window.assistants["fast_gemma"]));
	window.assistants["fast_gemma_2_2b_32bit"]["model_id"] = "gemma-2-2b-it-q4f32_1-MLC";
	window.assistants["fast_gemma_2_2b_32bit"]["web_llm_file_name"] = "gemma-2-2b-it-q4f32_1-MLC";
	window.assistants["fast_gemma_2_2b_32bit"]["model_file_name"] = "gemma-2-2b-it-q4f32_1-MLC/resolve/main/params_shard_79.bin"; // TODO: check last shard nr
	window.assistants["fast_gemma_2_2b_32bit"]["show_if_web_gpu"] = false;
	window.assistants["fast_gemma_2_2b_32bit"]["show_if_web_gpu32"] = true;
	
	window.assistants["fast_gemma_2_9b_it_32bit"] = JSON.parse(JSON.stringify(window.assistants["fast_gemma"]));
	window.assistants["fast_gemma_2_9b_it_32bit"]["model_id"] = "gemma-2-9b-it-q4f32_1-MLC";
	window.assistants["fast_gemma_2_9b_it_32bit"]["web_llm_file_name"] = "gemma-2-9b-it-q4f32_1-MLC";
	window.assistants["fast_gemma_2_9b_it_32bit"]["model_file_name"] = "gemma-2-9b-it-q4f32_1-MLC/resolve/main/params_shard_127.bin"; 
	window.assistants["fast_gemma_2_9b_it_32bit"]["show_if_web_gpu"] = false;
	window.assistants["fast_gemma_2_9b_it_32bit"]["show_if_web_gpu32"] = true;
	
	window.assistants["fast_zephyr_32bit"] = JSON.parse(JSON.stringify(window.assistants["fast_zephyr"]));
	window.assistants["fast_zephyr_32bit"]["model_id"] = "stablelm-2-zephyr-1_6b-q4f32_1-MLC";
	window.assistants["fast_zephyr_32bit"]["web_llm_file_name"] = "stablelm-2-zephyr-1_6b-q4f32_1-MLC";
	window.assistants["fast_zephyr_32bit"]["model_file_name"] = "stablelm-2-zephyr-1_6b-q4f32_1-MLC/resolve/main/params_shard_26.bin";
	window.assistants["fast_zephyr_32bit"]["show_if_web_gpu"] = false;
	window.assistants["fast_zephyr_32bit"]["show_if_web_gpu32"] = true;

	window.assistants["fast_tiny_llama_32bit"] = JSON.parse(JSON.stringify(window.assistants["fast_tiny_llama"]));
	window.assistants["fast_tiny_llama_32bit"]["web_llm_file_name"] = "TinyLlama-1.1B-Chat-v0.4-q4f32_1-1k-MLC";
	window.assistants["fast_tiny_llama_32bit"]["model_file_name"] = "TinyLlama-1.1B-Chat-v0.4-q4f32_1-MLC/resolve/main/params_shard_23.bin";
	window.assistants["fast_tiny_llama_32bit"]["show_if_web_gpu"] = false;
	window.assistants["fast_tiny_llama_32bit"]["show_if_web_gpu32"] = true;
	
	window.assistants["fast_qwen2_0_5b_32bit"] = JSON.parse(JSON.stringify(window.assistants["fast_qwen2_0_5b"]));
	window.assistants["fast_qwen2_0_5b_32bit"]["web_llm_file_name"] = "Qwen2-0.5B-Instruct-q0f32-MLC";
	window.assistants["fast_qwen2_0_5b_32bit"]["model_file_name"] = "Qwen2-0.5B-Instruct-q0f32-MLC/resolve/main/params_shard_24.bin";
	window.assistants["fast_qwen2_0_5b_32bit"]["show_if_web_gpu"] = false;
	window.assistants["fast_qwen2_0_5b_32bit"]["show_if_web_gpu32"] = true;
	
	window.assistants["fast_qwen2_5_coder_7b_32bit"] = JSON.parse(JSON.stringify(window.assistants["fast_qwen2_5_coder_1_5b"]));
	window.assistants["fast_qwen2_5_coder_7b_32bit"]["web_llm_file_name"] = "Qwen2.5-Coder-7B-Instruct-q4f32_1-MLC";
	window.assistants["fast_qwen2_5_coder_7b_32bit"]["model_file_name"] = "Qwen2.5-Coder-7B-Instruct-q4f32_1-MLC/resolve/main/params_shard_87.bin";
	window.assistants["fast_qwen2_5_coder_7b_32bit"]["show_if_web_gpu"] = false;
	window.assistants["fast_qwen2_5_coder_7b_32bit"]["show_if_web_gpu32"] = true;
	
	window.assistants["fast_qwen2_5_coder_1_5b_32bit"] = JSON.parse(JSON.stringify(window.assistants["fast_qwen2_5_coder_1_5b"]));
	window.assistants["fast_qwen2_5_coder_1_5b_32bit"]["web_llm_file_name"] = "Qwen2.5-Coder-1.5B-Instruct-q4f32_1-MLC";
	window.assistants["fast_qwen2_5_coder_1_5b_32bit"]["model_file_name"] = "Qwen2.5-Coder-1.5B-Instruct-q4f32_1-MLC/resolve/main/params_shard_29.bin";
	window.assistants["fast_qwen2_5_coder_1_5b_32bit"]["show_if_web_gpu"] = false;
	window.assistants["fast_qwen2_5_coder_1_5b_32bit"]["show_if_web_gpu32"] = true;
	
	for (const key of Object.keys(window.assistants)) {
		window.assistants[key]['clone_original'] = key;
	}
}


