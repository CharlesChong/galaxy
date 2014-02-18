define('views/submit',
       ['dropzone', 'l10n', 'notification', 'requests', 'routes_api', 'storage', 'urls', 'utils', 'z'],
       function(dropzone, l10n, notification, requests, routes_api, storage, urls, utils, z) {

    var gettext = l10n.gettext;

    function submitGame(data) {
        requests.post(urls.api.url('game.submit'), data).done(function(data) {
            notification.notification({message: gettext('Game successfully submitted')});
            z.page.trigger('navigate', urls.reverse('game', [data.slug]));
        }).fail(function(data) {
            notification.notification({message: gettext('Failed to submit game')});
        });
    }

    function editGame(data) {
        // TODO: change the post to a put when the backend is ready
        requests.post(urls.api.url('game.edit'), data).done(function(data) {
            notification.notification({message: gettext('Game details updated')});
            require('views').reload();
        }).fail(function(data) {
            notification.notification({message: gettext('Failed to update game details')});
        });
    }

    z.body.on('blur change keyup paste', 'input[name=name]', function(e) {
        // NOTE: We're using `keyup` instead of `keypress` to detect when
        // the user tabs within this field.
        var $this = $(this);
        var $slug = $this.closest('form').find('[name=slug]');

        $slug.val(utils.slugify($this.val()));

        // If the name is valid, the slug is valid so let the user tab over it.
        $slug.attr('tabIndex', this.checkValidity() ? '-1' : '');

        // Upon presence/absence of name, toggle the `focused` class so
        // :valid/:invalid styles get set on slug.
        $slug.toggleClass('focused', !!$this.val());
    }).on('blur change', 'input[type=file]', function(e) {
        // TODO: Replace with drag-and-drop library.
        var input = this;
        function readURL(input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var $filePreview = $(input).closest('.form-field').find('.file-preview');
                    $filePreview.show().css('background-image', 'url(' + e.target.result + ')');
                    var img = new Image();
                    img.src = e.target.result;
                    img.onload = function() {
                        $filePreview.siblings('.file-size').html(this.width + 'px &times; ' + this.height + 'px').show();
                    };
                };
                reader.readAsDataURL(input.files[0]);
            }
        }
        input.blur();
        readURL(this);
        // TODO: Allow user to delete/replace (and possibly resize/crop) images.
        // TODO: Allow previewing of videos.
        // TODO: Allow multiple icons/screenshots/videos.
    }).on('submit', '.game-form', function(e) {
        e.preventDefault();
        var $this = $(this);
        var data = {
            name: $this.find('[name=name]').val(),
            slug: $this.find('[name=slug]').val(),
            app_url: $this.find('[name=app_url]').val(),
            description: $this.find('[name=description]').val(),
            privacy_url: $this.find('[name=privacy]').val(),
            genre: $this.find('[name=genre]:checked').val()
        };
        if ($(this).data('formtype') === 'submit') {
            submitGame(data);
        } else if ($(this).data('formtype') === 'edit') {
            editGame(data);
        }
    });

    return function(builder) {
        builder.start('submit.html').done(function() {
            // new dropzone('.submit-form', {
            //     uploadMultiple: true
            // });
            var $fallback = $('.fallback');
            function createInput($section) {
                var $input = document.createElement('input');
                $input.setAttribute('type', 'text');
                $input.setAttribute('placeholder', $section.attr('data-placeholder'));
                $section.append($input);
            }
            $.each($fallback, function() {
                createInput($(this));
            });
            $('.screenshots, .videos').on('input', 'input[type=text]', function(e) {
                var $input = $(e.target);
                var $allInputs = $input.parent().children('input[type=text]');
                var $emptyInputs = $allInputs.filter(function() {
                    return $(this).val() === '';
                });

                if ($input.val() === '') {
                    console.log($emptyInputs.length);
                    for (var i = $emptyInputs.length - 1; i > 0; i--) {
                        $emptyInputs[i].remove();
                    }
                } else {                    
                    if ($emptyInputs.length === 0) {
                        createInput($input.parent());
                    }
                }


            });
        });

        builder.z('type', 'leaf submit');
        builder.z('title', gettext('Submit a Game'));
    };
});
