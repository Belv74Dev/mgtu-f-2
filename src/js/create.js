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

export default { createCailInput, createCailSelect };