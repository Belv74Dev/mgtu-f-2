import db from './init';
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import _formatingSecondToDate from './service';

const createCailInput = (value, type='text') => {
  const td = document.createElement('td');
  td.className = 'student-table__cail';
  td.innerHTML = `<input class="student-table__input" type=${type} value=${value}>`;
  return td;
}

const createCailSelect = (options, value) => {
  const td = document.createElement('td');
  td.className = 'student-table__cail';

  const select = document.createElement('select');
  select.className = 'student-table__input';
  
  options.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;

    select.append(option);
  })
  select.value = value;

  td.append(select);
  return td;
}

// // *** Get group
// async function getGroup(db) {
//   const groupCol = collection(db, '/group');
//   const groupSnapshot = await getDocs(groupCol);
//   const groupList = groupSnapshot.docs.map(doc => {
// 		return {
// 			...doc.data(), 
// 			id: doc.id,
// 		}
// 	}
// 	);
//   return groupList;
// }
// let group = await getGroup(db);

//  *** Get students
async function getStudents(db) {
  const studentsCol = collection(db, '/students');
  const studentsSnapshot = await getDocs(studentsCol);
  const studentsList = studentsSnapshot.docs.map(doc => {
		return {
			...doc.data(), 
			id: doc.id,
			birthd: _formatingSecondToDate(doc.data().birthd.seconds)
		}
	}
	);
  return studentsList;
}
let data = await getStudents(db);

// *** Render table
const table = document.querySelector('.student-table');

const handlerOkItem = (e) => {
	const tr = e.target.parentElement.parentElement.parentElement;

	tr.classList.add('del-this-item');
	const id = tr.getAttribute('data-id');
	const docRef = doc(db, '/students', id);

	tr.classList.add('update-this-item-start');
	const inputs = tr.querySelectorAll('input');
	const select = tr.querySelector('select');
	const dataItem = {
		lastname : inputs[0].value,
		firstname: inputs[1].value,
		patronymic: inputs[2].value,
		birthd: new Date(inputs[3].value),
		score: inputs[4].value,
		group: select.value,
	}

	data = data.map(item => {
		if (item.id == id) return {id, ...dataItem}
		return item;
	});

	updateDoc(docRef, dataItem)
	.then(() => {
		tr.classList.add('update-this-item-end');
	})
	.catch(error => {
		console.log('Error update: ', error);
	})
}

const handlerDelItem = (e) => {
	const tr = e.target.parentElement.parentElement.parentElement;

	// del listener in ok
	const ok = tr.querySelector('.ok'); 
	ok.removeEventListener('click', handlerOkItem)

	tr.classList.add('del-this-item');
	const id = tr.getAttribute('data-id');

	data = data.filter(item => item.id === id);

	const docRef = doc(db, '/students', id);
	deleteDoc(docRef)
	.then(() => {
		tr.parentNode.removeChild(tr);
	})
	.catch(error => {
		console.log('Error del: ', error);
	});
}

const createCailBtn = () => {
  const td = document.createElement('td');
  td.className = 'student-table__cail student-table__action';

	const ok = document.createElement('div');
	ok.className = 'student-table__action-img ok';
	ok.innerHTML = '<img src="./img/ok.svg" alt="Сохранить" class="student-table__action-edit">'
	ok.addEventListener('click', handlerOkItem)
	td.append(ok);

	const del = document.createElement('div');
	del.className = 'student-table__action-img del';
	del.innerHTML = '<img src="./img/del.svg" alt="Удалить" class="student-table__action-edit">'
	del.addEventListener('click', handlerDelItem, {once: true});
	td.append(del);
  return td;
};

const group = [...new Set(data.map((item) => item?.group))];

const renderTable = (data) => {
	data.forEach((item) => {
		const tr = document.createElement('tr');
		tr.className = 'student-table__row tr-data';
		tr.setAttribute('data-id', item.id)
	
		tr.append(createCailInput(item?.lastname || ''));
		tr.append(createCailInput(item?.firstname || ''));
		tr.append(createCailInput(item?.patronymic) || '');
		tr.append(createCailInput(item?.birthd || '', 'date'));
		tr.append(createCailInput(item?.score)) || '';
		console.log(group)
		tr.append(createCailSelect(group, item.group))
	
		tr.append(createCailBtn());

		table.append(tr);
	});
};
renderTable(data);

// *** filtration 
const hiddenElements = (data) => {
	let trs = [...document.querySelectorAll(`.tr-data`)];
	trs.forEach((tr) => {
		tr.classList.add('hidden')
	});
	trs = trs.filter(tr => {
		const id = tr.getAttribute('data-id');
		let hasId = false;
		data.forEach((item) => {
			if (item.id === id) hasId = true;
		})
		return hasId; 
	})
	trs.forEach((tr) => {
		tr.classList.remove('hidden')
	});
}

const filterForm = document.querySelector('.filter-form'),
			lastname = document.querySelector('#lastname'),
			firstname = document.querySelector('#firstname'),
			patronymic = document.querySelector('#patronymic'),
			birthd = document.querySelector('#birthd'),
			minScore = document.querySelector('#min-score'),
			maxScore = document.querySelector('#max-score'),
			selectGroup = document.querySelector('#select-group');

const filterStringField = (data) => {
	let arr = data; 
	return (filter, field, target) => {
		switch (filter) {
			case 'str-part':
				arr = arr.filter(item => item[field].toLowerCase().indexOf(target.toLowerCase()) !== -1);
				break;
			case 'str-full':
				arr = arr.filter(item => item[field] === target);
				break;
			case 'num-min':
				arr = arr.filter(item => +item[field] >= +target);
				break;
			case 'num-max':
				arr = arr.filter(item => +item[field] <= +target);
				break;
		}
		return arr;
	}
};

const onFilterFunction = () => {
	const getfilterItems = filterStringField([...data]);

	if (lastname.value) getfilterItems('str-part', 'lastname', lastname.value);
	if (firstname.value) getfilterItems('str-part', 'firstname', firstname.value);
	if (patronymic.value) getfilterItems('str-part', 'patronymic', patronymic.value);
	if (birthd.value) getfilterItems('str-full', 'birthd', birthd.value);
	if (minScore.value) getfilterItems('num-min', 'score', minScore.value);
	if (maxScore.value) getfilterItems('num-max', 'score', maxScore.value);
	if (selectGroup.value !== 'null') getfilterItems('str-full', 'group', selectGroup.value);

	hiddenElements(getfilterItems());
}

filterForm.addEventListener('submit', (e) => {
	e.preventDefault();

	onFilterFunction();
});

// *** sort
const sortFieldArr = document.querySelectorAll('td.sortable');

const sortingField = (type, field) => {
	console.log(1)
	if (type === 'sort-up') 
		return data.sort((a, b) => a[field].localeCompare(b[field]));
	console.log(2)
	if (type === 'sort-down') 
		return data.sort((a, b) => b[field].localeCompare(a[field]));
	console.log(3)
	return data;
}

sortFieldArr.forEach((sortField) => {
	sortField.addEventListener('click', () => {
		if (sortField.classList.contains('sort-up')) {
			sortField.classList.remove('sort-up');
			sortField.classList.add('sort-down');
		}
		else if (sortField.classList.contains('sort-down')) {
			sortField.classList.remove('sort-down');
		}
		else {
			sortFieldArr.forEach((item) => {
				item.classList.remove('sort-up');
				item.classList.remove('sort-down');
			})
			sortField.classList.add('sort-up');
		}

		let cz = 'none';
		if (sortField.classList.contains('sort-up')) cz = 'sort-up';
		else if (sortField.classList.contains('sort-down')) cz = 'sort-down';
		// const sortedData = sortingField(cz, sortField.getAttribute('data-field'));
		data = sortingField(cz, sortField.getAttribute('data-field'));
		document.querySelectorAll('.student-table__row.tr-data').forEach((item) => {
			item.parentNode.removeChild(item);
		})
		renderTable(data);
		onFilterFunction();
	})
});