document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        window.location.href = '/entrar';
        return;
    }

    const fetchUserData = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/user/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                document.getElementById('user-photo').src = userData.foto || 'assets/default.png';
                document.getElementById('user-name').textContent = userData.nome || 'Usuário';
            } else {
                const errorData = await response.text();
                console.error(`Erro ao obter dados do usuário: ${errorData}`);
                throw new Error('Erro ao obter dados do usuário');
            }
        } catch (error) {
            console.error('Erro ao obter dados do usuário:', error);
            document.getElementById('user-photo').src = 'assets/default.png';
            document.getElementById('user-name').textContent = 'Erro ao obter dados do usuário';
        }
    };

    // Função para buscar e exibir os cursos
    const fetchCourses = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/courses', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const courses = await response.json();
                const coursesList = document.getElementById('courses-list');
                coursesList.innerHTML = '';

                courses.forEach(course => {
                    const courseItem = document.createElement('div');
                    courseItem.className = 'course-item';
                    courseItem.innerHTML = `
                        <img src="${course.imagem}" alt="${course.nome} image">
                        <h3>${course.nome}</h3>
                        <div class="buttons">
                            <button class="edit-course-btn" data-id="${course.id}">Editar</button>
                            <button class="delete-course-btn" data-id="${course.id}">Excluir</button>
                        </div>
                    `;
                    courseItem.querySelector('.edit-course-btn').addEventListener('click', () => openEditModal(course));
                    courseItem.querySelector('.delete-course-btn').addEventListener('click', () => deleteCourse(course.id));
                    courseItem.addEventListener('click', () => showCourseDetails(course));
                    coursesList.appendChild(courseItem);
                });
            } else {
                const errorData = await response.text();
                console.error(`Erro ao obter cursos: ${errorData}`);
                alert(`Erro ao obter cursos: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Erro ao conectar com o servidor:', error);
            alert('Erro ao conectar com o servidor');
        }
    };

    // Função para exibir os detalhes do curso
    const showCourseDetails = (course) => {
        const courseDetails = document.getElementById('course-details');
        courseDetails.innerHTML = `
            <img src="${course.imagem}" alt="${course.nome} image" style="max-width: 300px; height: auto;">
            <h2>${course.nome}</h2>
            <p>${course.descricao}</p>
            <p>Duração: ${course.duracao} horas</p>
        `;
    };

    // Função para adicionar um novo curso
    const addCourse = async (course) => {
        try {
            const response = await fetch('http://localhost:3000/api/courses', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(course)
            });

            if (response.ok) {
                fetchCourses();
            } else {
                const errorData = await response.text();
                console.error(`Erro ao adicionar curso: ${errorData}`);
                alert(`Erro ao adicionar curso: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Erro ao conectar com o servidor:', error);
            alert('Erro ao conectar com o servidor');
        }
    };

    // Função para atualizar um curso existente
    const updateCourse = async (id, course) => {
        try {
            const response = await fetch(`http://localhost:3000/api/courses/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(course)
            });

            if (response.ok) {
                fetchCourses();
            } else {
                const errorData = await response.text();
                console.error(`Erro ao atualizar curso: ${errorData}`);
                alert(`Erro ao atualizar curso: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Erro ao conectar com o servidor:', error);
            alert('Erro ao conectar com o servidor');
        }
    };

    // Função para excluir um curso existente
    const deleteCourse = async (id) => {
        try {
            const response = await fetch(`http://localhost:3000/api/courses/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchCourses();
            } else {
                const errorData = await response.text();
                console.error(`Erro ao excluir curso: ${errorData}`);
                alert(`Erro ao excluir curso: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Erro ao conectar com o servidor:', error);
            alert('Erro ao conectar com o servidor');
        }
    };

    // Função para abrir o modal de adicionar curso
    const openAddModal = () => {
        isEditing = false;
        currentCourseId = null;
        document.getElementById('modal-title').textContent = 'Adicionar Curso';
        document.getElementById('add-course-form').reset();
        document.getElementById('add-course-modal').style.display = 'block';
    };

    // Função para abrir o modal de editar curso
    const openEditModal = (course) => {
        isEditing = true;
        currentCourseId = course.id;
        document.getElementById('modal-title').textContent = 'Editar Curso';
        document.getElementById('nome').value = course.nome;
        document.getElementById('descricao').value = course.descricao;
        document.getElementById('duracao').value = course.duracao;
        document.getElementById('imagem').value = course.imagem;
        document.getElementById('add-course-modal').style.display = 'block';
    };

    // Função para fechar o modal de adicionar/editar curso
    const closeAddModal = () => {
        document.getElementById('add-course-modal').style.display = 'none';
    };

    // Evento para adicionar ou editar um curso
    document.getElementById('add-course-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const descricao = document.getElementById('descricao').value;
        const duracao = document.getElementById('duracao').value;
        const imagem = document.getElementById('imagem').value;

        const course = { nome, descricao, duracao, imagem };

        if (isEditing) {
            await updateCourse(currentCourseId, course);
        } else {
            await addCourse(course);
        }
        closeAddModal(); // Fechar o modal após adicionar/editar o curso
    });

    // Evento para abrir o modal de adicionar curso
    document.getElementById('add-course-btn').addEventListener('click', openAddModal);

    // Evento para fechar o modal de adicionar/editar curso
    document.querySelector('.close').addEventListener('click', closeAddModal);

    // Inicializar a página
    fetchUserData();
    fetchCourses();

    // Função para mostrar ou esconder o botão "Voltar ao Topo"
    const backToTopButton = document.getElementById('back-to-top');
    window.onscroll = () => {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            backToTopButton.style.display = 'block';
        } else {
            backToTopButton.style.display = 'none';
        }
    };

    // Função para rolar a página para o topo
    backToTopButton.addEventListener('click', () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    });

    // Função para alternar o menu lateral
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
});