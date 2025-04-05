function showSection(event, sectionId) {
    document.querySelectorAll('.edit-section').forEach(div => div.classList.remove('active'));
    const selected = document.getElementById('section-' + sectionId);
    selected?.classList.add('active');

    document.querySelectorAll('.edit-sidebar li').forEach(li => li.classList.remove('active'));
    document.querySelector(`.edit-sidebar li[onclick*="${sectionId}"]`)?.classList.add('active');

    history.replaceState(null, null, '#section-' + sectionId);
}

window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash;
    const wrapper = document.querySelector('.edit-profile-wrapper');
const defaultSection = wrapper?.dataset.section || 'personal';
const section = hash ? hash.replace('#section-', '') : defaultSection;


    const fakeEvent = {
        target: document.querySelector(`.edit-sidebar li[onclick*="${section}"]`)
    };
    showSection(fakeEvent, section);

    const passwordInput = document.getElementById('passwordInput');
    const strengthText = document.getElementById('passwordStrength');

    if (passwordInput && strengthText) {
        passwordInput.addEventListener('input', () => {
            const val = passwordInput.value;
            let strength = '—', className = '';
            if (val.length >= 6) {
                const hasNumber = /\d/.test(val);
                const hasUpper = /[A-Z]/.test(val);
                const hasSpecial = /[!@#$%^&*]/.test(val);
                if (hasNumber && hasUpper && hasSpecial) {
                    strength = 'Strong'; className = 'strong';
                } else if ((hasNumber && hasUpper) || (hasUpper && hasSpecial)) {
                    strength = 'Medium'; className = 'medium';
                } else {
                    strength = 'Weak'; className = 'weak';
                }
            }
            strengthText.className = `password-strength ${className}`;
            strengthText.querySelector('span').textContent = strength;
        });
    }
});

document.getElementById('upload-photo')?.addEventListener('change', function () {
    if (this.files.length > 0) {
        document.getElementById('photoForm').submit();
    }
});

function confirmDeleteRating(event) {
    event.preventDefault();
    Swal.fire({
        title: "Are you sure?",
        text: "This rating will be deleted permanently.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel"
    }).then((result) => {
        if (result.isConfirmed) {
            event.target.submit();
        }
    });
    return false;
}

function confirmPersonalSave() {
    Swal.fire({
        title: "Save Changes?",
        text: "Do you want to update your profile information?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, save it",
        cancelButtonText: "Cancel"
    }).then(result => {
        if (result.isConfirmed) {
            document.getElementById('personalForm').submit();
        }
    });
}

function confirmPasswordSave(event) {
    event.preventDefault();
    Swal.fire({
        title: "Change Password?",
        text: "Are you sure you want to change your password?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, change it",
        cancelButtonText: "Cancel"
    }).then(result => {
        if (result.isConfirmed) {
            event.target.closest('form').submit();
        }
    });
    return false;
}
