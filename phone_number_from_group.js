chat_titles = [];
phone_numbers = [];
chats_container = getElementsByXPath('//*[@aria-label="Chat list"][@role="grid"]')[0];
do {
	beginning_length = chat_titles.length;
	all_chats = getElementsByXPath('//*[@data-testid="cell-frame-container"]', chats_container);
	lowest_loc = -1;
	lowest_loc_i = -1;
	for (i=0; i<all_chats.length; i++) {
		archive_check = getElementsByXPath('div[2]/div[1]/div[1]', all_chats[i])[0].innerText;
		if (archive_check == 'Archived') {
			console.log(i + ' - Archived');
		} else {
			chat_title = getElementsByXPath('div[2]/div[1]/div[1]/span', all_chats[i])[0].innerText;
			console.log(i + ' - ' + chat_title);
			back_buttons = getElementsByXPath('//*[@data-testid="back"]');
			if (back_buttons.length >= 2) {
				back_buttons[0].click();
				await sleep(1000);
			} else {
				if (lowest_loc < all_chats[i].getBoundingClientRect().top) {
					lowest_loc = all_chats[i].getBoundingClientRect().top;
					lowest_loc_i = i;
				}
				if (chat_titles.indexOf(chat_title) == -1) {
					all_chats[i].click();
					simulateMouseEvents(all_chats[i], 'mousedown');
					await sleep(2000);
					chat_window = document.getElementById('main');
					group_members_container = getElementsByXPath('//*[contains(text(), ", You")]', chat_window)
					if (group_members_container.length > 0) {
						group_members = group_members_container[0].title.split(', ');
						for (group_member_i=0; group_member_i<group_members.length; group_member_i++) {
							if (!group_members[group_member_i].match(/[a-z]/i)) {
								phone_number = group_members[group_member_i].replace(/[^\d]/g, '');
								if (phone_numbers.indexOf(phone_number) == -1) {
									phone_numbers.push(phone_number);
								}
							}
						}
					}
					chat_titles.push(chat_title);
				}
			}
		}
	}
	all_chats[lowest_loc_i].scrollIntoView();
	ending_length = chat_titles.length;
	console.log(ending_length + ' chats scanned.');
	await sleep(500);
} while (beginning_length != ending_length)

download_data(phone_numbers);
console.log('Done');


function getElementsByXPath(xpath, parent) {
	let results = [];
	let query = document.evaluate(xpath, parent || document,
		null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	for (let i = 0, length = query.snapshotLength; i < length; ++i) {
		results.push(query.snapshotItem(i));
	}
	return results;
}

function simulateMouseEvents(element, eventName) {
	var mouseEvent= document.createEvent ('MouseEvents');
	mouseEvent.initEvent (eventName, true, true);
	element.dispatchEvent (mouseEvent);
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function download_data(data) {
    let csvContent = "data:text/csv;charset=utf-8,";
    data.forEach(function(rowArray) {
        let row = '"' + rowArray + '"';
        csvContent += row + "\r\n";
    });
    encodedUri = encodeURI(csvContent);
    link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "phone_numbers.csv");
    document.body.appendChild(link);
    link.click();
}
