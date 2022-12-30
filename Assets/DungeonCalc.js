$(function() {
	dynamicAdd(); //Call before anything else bc you need it for the other functions.
    if(localStorage.getItem('API_key')!==null){
		$('#apikey').val(localStorage.getItem('API_key'));
		wallet(localStorage.getItem('API_key'));
		dungeonFreq(localStorage.getItem('API_key'));
		checkSkins(localStorage.getItem('API_key'));
	}
	// Deals with view port
	if (($('.navbar').height()*2)>$(window).height()===true){
		console.log('tto large');
		$('.navbar').removeClass('sticky-top');
	}
	dungeonMath(); //Call once for people w/o api key to read general info.
});

function setAPIkey() {
	if($('#apikey').val()!==''){
		localStorage.setItem('API_key', $('#apikey').val());
		$('#api_status').text('Key Added!').css('color','green');
		wallet(localStorage.getItem('API_key'));
		dungeonFreq(localStorage.getItem('API_key'));
		checkSkins(localStorage.getItem('API_key'));
	} else {
		$('#api_status').text('No Key Added.').css('color','red');
	}
}

function removeAPIkey() {
	localStorage.removeItem('API_key');
	$('#api_status').text('Key Removed!').css('color','blue');
}

//Wallet JS
function wallet(API_key) {
	var dungeons_abbr=['AC','CM','TA','SE','CoF','HotW','CoE','Arah']
	var dungeon_currencies = [5,9,11,10,13,12,14,6]
	var dungeon_icons = ['https://render.guildwars2.com/file/2AA9C0B030BE152B915E0174D7F0495FDA711C54/619318.png','https://render.guildwars2.com/file/C97B0607A6DB1FA1469D1DBBF2F107A057F8A313/619322.png','https://render.guildwars2.com/file/F6F4F39212AF3324223D73BAA807026BD863997C/619324.png','https://render.guildwars2.com/file/B83A4ED528FC237D4D1862CDD0250B773EAB36AA/619323.png','https://render.guildwars2.com/file/310CA245DBF61A54BD0C5D5361E26F0821FCAAFD/619326.png','https://render.guildwars2.com/file/2B9E2BC9D5D080C54C17E27CECACEFFC0D64EE22/619325.png','https://render.guildwars2.com/file/37CCE672250A3170B71760949C4C9C9B186517B1/619327.png','https://render.guildwars2.com/file/06083C4F7321512918E23D57B999F04E94C8D9A3/619319.png']
	var dungeon_money = ['Ascalonian Tear','Seal of Beetletun','Deadly Bloom','Manifesto of the Moletariate','Flame Legion Charr Carving','Symbol of Koda','Knowledge Crystal','Shard of Zhaitan']
	
	// Clear table entries just in case
	for (x in dungeon_currencies) {
			$('#'+dungeons_abbr[x]+'_currency').html('')
			$('#'+dungeons_abbr[x]+'_currency').attr('value','');
	}
	
	$.get('https://api.guildwars2.com/v2/account/wallet?access_token='+API_key).done(function(data) {
		$.each(data, function(index, val) {
			//console.log(val)	

			for (x in dungeon_currencies) {
				if (this.id===dungeon_currencies[x]){
					//console.log('Found it: ' + dungeons_abbr[x]);
					$('#'+dungeons_abbr[x]+'_currency').html('<td>'+dungeon_money[x]+'</td><td>'+this.value.toLocaleString()+'</td><td><img class="currency_icon"src="'+dungeon_icons[x]+'"></td>')
					$('#'+dungeons_abbr[x]+'_currency').attr('value',this.value);
				}
			}			
		});
		// Deal with No Dungeon Money
		for (x in dungeon_currencies){
			if ($('#'+dungeons_abbr[x]+'_currency').is(':empty')){
				$('#'+dungeons_abbr[x]+'_currency').html('<td>'+dungeon_money[x]+'</td><td>0</td><td><img class="currency_icon"src="'+dungeon_icons[x]+'"></td>')
					$('#'+dungeons_abbr[x]+'_currency').attr('value',0);
			}
		}
		$('#api_status').text('Valid Key!').css('color','green');
	}).fail(function() {
		console.log("API Key Error!");
		$('#api_status').text('Bad Key!').css('color','red');
	})
}

// Dungeon Freq
function dungeonFreq(API_key) {
	// Clear old marks
	$('[bit]').css('color','');
	
	$.get('https://api.guildwars2.com/v2/account/achievements?access_token='+API_key).done(function(data) {
		$.each(data, function(index, val) {
			if (this.id===2963){
				//console.log(val.bits);
				$('#dungeonFreq_Counter').text(val.current)
				for (x in val.bits){
					//console.log(val.bits[i])
					$('[bit='+val.bits[x]+']').css('color','red')
				}
			}
			
		});
		$('#api_status').text('Valid Key!').css('color','green');
	}).fail(function() {
		console.log("API Key Error!");
		$('#api_status').text('Bad Key!').css('color','red');
	})
}

//Dungeon Skins
function getSkins(appendLoc, skin_id, bit_index) {
	$.get('https://api.guildwars2.com/v2/skins/'+skin_id).done(function(data) {
		if (data.details.weight_class==null){
			// Assume Weapon
			$(appendLoc+' .weapon .col [data-type="'+data.details.type+'"]').append('<img src="'+data.icon+'">'+data.name);
			$(appendLoc+' .weapon .col [data-type="'+data.details.type+'"]').attr('data-skins_id',skin_id).attr('data-bit_index',bit_index);
		} else {
			// Assume Skin
			$(appendLoc+' .armor [data-weight_class="'+data.details.weight_class+'"] [data-type="'+data.details.type+'"]').append('<img src="'+data.icon+'">'+data.name)
			$(appendLoc+' .armor [data-weight_class="'+data.details.weight_class+'"] [data-type="'+data.details.type+'"]').attr('data-skins_id',skin_id).attr('data-bit_index',bit_index);
		}
	}).fail(function() {
		console.log("API Skin Error!");
	})
}

function getDungeonSkins (appendLoc,achievements_id) {
	$.get('https://api.guildwars2.com/v2/achievements/'+achievements_id).done(function(data) {
		//console.log(data.bits);
		for (x in data.bits){
			getSkins(appendLoc, data.bits[x].id, x);
		}
		// Shit gets buggy try to stop it by recalling check function.
		if(localStorage.getItem('API_key')!==null){
			checkSkins(localStorage.getItem('API_key'));
		}
	}).fail(function() {
		console.log("API Achievement Error!");
	})
}

	getDungeonSkins('#AC_Skins','1725');
	getDungeonSkins('#CM_Skins','1723');
	getDungeonSkins('#TA_Skins','1721');
	getDungeonSkins('#SE_Skins','1722');
	getDungeonSkins('#CoF_Skins','1714');
	getDungeonSkins('#HotW_Skins','1718');
	getDungeonSkins('#CoE_Skins','1719');
	getDungeonSkins('#Arah_Skins','1724');

// Strikeout Owned Skins - Have Dungeon Skins Pull first then do this.
function checkSkins(API_key) {
	// Clear 
	$('[data-bit_index]').removeClass('used')
	
	$.get('https://api.guildwars2.com/v2/account/achievements?access_token='+API_key).done(function(data) {
	var a = [1725, 1723, 1721, 1722, 1714, 1718, 1719, 1724];
		$.each(data, function(index, val) {
			//console.log(val);
			for (x in a) { // Cycle Throught Achievement Sets
				if (this.id===a[x]){
					// Catch if collection is done 
					if (this.done===true) {
						$('[data-achievement_id="'+a[x]+'"] .skin_counter').text('37');
						$('[data-achievement_id="'+a[x]+'"] [data-bit_index]').addClass('used');
					} else {
						//console.log(this.id, 'Done '+this.bits.length);
						$('[data-achievement_id="'+a[x]+'"] .skin_counter').text(this.bits.length);
						//console.log(this.bits);
						for (i in this.bits) { // Matching whats done
							//console.log(a[x], this.bits[i]);						
							$('[data-achievement_id="'+a[x]+'"] [data-bit_index="'+this.bits[i]+'"]').addClass('used');
						}
					}
				}
            }
		});
		dungeonMath();
	}).fail(function() {
		console.log("API Acccount & Achievement Error!");
	})
}

// Read the remaining skins and math it out.
function dungeonMath() {
	var dungeons_abbr=['AC','CM','TA','SE','CoF','HotW','CoE','Arah'];
	var skins = ['Helm','Shoulders','Coat','Gloves','Leggings','Boots'];
	var weapons =['TwoHand','OneHand','OffHand'];

	for (d in dungeons_abbr) {
		var remaining_skins=0;
		var remaining_weapons=0;
		
		for (s in skins) {
			//console.log(dungeons_abbr[d], skins[s], $('#'+dungeons_abbr[d]+'_Skins').find('[data-type="'+skins[s]+'"]:not(.used)').length);
			switch (skins[s]) {
				case 'Helm':
				case 'Gloves':
				case 'Boots':
					var ammount = 180;
				break; 
				case 'Shoulders':
					var ammount = 210;
				break;
				case 'Leggings':
					var ammount = 300;
				break;
				case 'Coat':
					var ammount = 330;
				break;
			}
			remaining_skins=remaining_skins+(ammount*$('#'+dungeons_abbr[d]+'_Skins').find('[data-type="'+skins[s]+'"]:not(.used)').length);
		}
		//console.log('Remaining Armor '+dungeons_abbr[d], +remaining_skins);
		$('#'+dungeons_abbr[d]+'_Skins .armor_tokens_left').text(remaining_skins.toLocaleString());
		for (w in weapons) {
			//console.log(dungeons_abbr[d], weapons[w], $('#'+dungeons_abbr[d]+'_Skins').find('[data-type-itemclass="'+weapons[w]+'"]:not(.used)').length);
			switch (weapons[w]) {
				case 'OffHand':
					var ammount = 210;
				break;
				case 'OneHand':
					var ammount = 300;
				break;
				case 'TwoHand':
					var ammount = 390;
				break;
			}
			remaining_weapons=remaining_weapons+(ammount*$('#'+dungeons_abbr[d]+'_Skins').find('[data-type-itemclass="'+weapons[w]+'"]:not(.used)').length);
		}
		//console.log('Remaining Weapons '+dungeons_abbr[d], +remaining_weapons);
		$('#'+dungeons_abbr[d]+'_Skins .weapon_tokens_left').text(remaining_weapons.toLocaleString());
		$('#'+dungeons_abbr[d]+'_Skins .tokens_left').text((remaining_skins+remaining_weapons).toLocaleString());
		var wallet_val = 0;
		if($('#'+dungeons_abbr[d]+'_currency').attr('value')!==undefined){
			wallet_val = parseInt($('#'+dungeons_abbr[d]+'_currency').attr('value'));
		}
		$('#'+dungeons_abbr[d]+'_Skins .your_tokens').text(wallet_val.toLocaleString());
		var crap_left = (remaining_skins + remaining_weapons)/300;
		$('#'+dungeons_abbr[d]+'_Skins .time_left').text(crap_left.toLocaleString());
		if (wallet_val>=(remaining_skins + remaining_weapons)){
			$('#'+dungeons_abbr[d]+'_Skins').find('.collection_could_do').show();
		}
		if ((remaining_skins + remaining_weapons)===0){
			$('#'+dungeons_abbr[d]+'_Skins').find('.collection_could_do').hide();
			$('#'+dungeons_abbr[d]+'_Skins').find('.collection_completed').show();
		}
	}
}
/* See Set_DungeonCalc.html for less compressed info */
function dynamicAdd() {
	var dungeons_abbr=['AC','CM','TA','SE','CoF','HotW','CoE','Arah'];
	var dungeon_names=['Ascalonian Catacombs','Caudecus\'s Manor','Twilight Arbor','Sorrow\'s Embrace','Citadel of Flame','Honor of the Waves','Crucible of Eternity','The Ruined City of Arah'];
	for (d in dungeons_abbr) {
		$('#'+dungeons_abbr[d]+'_Skins').append('<a data-toggle="collapse" href="#'+dungeons_abbr[d]+'_Skins_Container" role="button" aria-expanded="false" aria-controls="'+dungeons_abbr[d]+'_Skins_Container"><h2>'+dungeon_names[d]+' Collector (<span class="skin_counter">X</span> / 37)</h2></a>');
		$('#'+dungeons_abbr[d]+'_Skins').append('<div class=".collapse show"id="'+dungeons_abbr[d]+'_Skins_Container"><div class=calculation><p>You have <span class=your_tokens>NUM_OF_TOKENS</span> tokens to complete your armor collection you need <span class=armor_tokens_left>TOKENS_NEEDED_FOR_ARMOR</span>.<p>You have <span class=your_tokens>NUM_OF_TOKENS</span> tokens to complete your weapon collection you need <span class=weapon_tokens_left>TOKENS_NEEDED_FOR_WEAPONS</span>.<p>You have <span class=your_tokens>NUM_OF_TOKENS</span> tokens to complete your the entire collection you need <span class=tokens_left>TOKENS_NEEDED_FOR_ALL</span>.<p>It will take you a minimum of <span class=time_left>NUMBER_OF_DAYS</span> days to complete the collection if you do all 3 paths getting 300 tokens.<p class="collection_could_do" style="display:none;">You have all the tokens needed to complete this collection.</p><p class="collection_completed" style="display:none;">This collection is completed!</p></div><h3>Armors — <span class=armor_tokens_left></span></h3><div class="row armor"><div class=col data-weight_class=Light><h4>Light Armor</h4><div class=item-details data-type=Helm></div><div class=item-details data-type=Shoulders></div><div class=item-details data-type=Coat></div><div class=item-details data-type=Gloves></div><div class=item-details data-type=Leggings></div><div class=item-details data-type=Boots></div></div><div class=col data-weight_class=Medium><h4>Medium Armor</h4><div class=item-details data-type=Helm></div><div class=item-details data-type=Shoulders></div><div class=item-details data-type=Coat></div><div class=item-details data-type=Gloves></div><div class=item-details data-type=Leggings></div><div class=item-details data-type=Boots></div></div><div class=col data-weight_class=Heavy><h4>Heavy Armor</h4><div class=item-details data-type=Helm></div><div class=item-details data-type=Shoulders></div><div class=item-details data-type=Coat></div><div class=item-details data-type=Gloves></div><div class=item-details data-type=Leggings></div><div class=item-details data-type=Boots></div></div></div><h3>Weapons — <span class=weapon_tokens_left></span></h3><div class="row weapon"><div class=col><h4>Two Handed</h4><div class=item-details data-type=Greatsword data-type-itemclass=TwoHand></div><div class=item-details data-type=Hammer data-type-itemclass=TwoHand></div><div class=item-details data-type=Longbow data-type-itemclass=TwoHand></div><div class=item-details data-type=Rifle data-type-itemclass=TwoHand></div><div class=item-details data-type=Shortbow data-type-itemclass=TwoHand></div><div class=item-details data-type=Staff data-type-itemclass=TwoHand></div><div class=item-details data-type=Speargun data-type-itemclass=TwoHand></div><div class=item-details data-type=Spear data-type-itemclass=TwoHand></div><div class=item-details data-type=Trident data-type-itemclass=TwoHand></div></div><div class=col><h4>One Handed</h4><div class=item-details data-type=Axe data-type-itemclass=OneHand></div><div class=item-details data-type=Dagger data-type-itemclass=OneHand></div><div class=item-details data-type=Mace data-type-itemclass=OneHand></div><div class=item-details data-type=Pistol data-type-itemclass=OneHand></div><div class=item-details data-type=Sword data-type-itemclass=OneHand></div><div class=item-details data-type=Scepter data-type-itemclass=OneHand></div><div class=item-details data-type=Focus data-type-itemclass=OffHand></div><div class=item-details data-type=Shield data-type-itemclass=OffHand></div><div class=item-details data-type=Torch data-type-itemclass=OffHand></div><div class=item-details data-type=Warhorn data-type-itemclass=OffHand></div></div></div></div>');
	}
}
