define('views/review', 
    ['format', 'log', 'notification', 'requests', 'urls', 'z'], 
    function(format, log, notification, requests, urls, z) {
    
    var console = log('review');

    function submitReview($game, $button, accepted) {
        function setSpinning(spinning) {
            var newVisibility = spinning ? 'hidden' : 'visible';
            $button.children('.btn-text').css('visibility', newVisibility);
            if (spinning) {
                $button.append('<div class="spinner"></div>');
            } else {
                $button.children('.spinner').remove();
            }
        }
        setSpinning(true);

        var gameSlug = $game.data('gameSlug');
        var statusVerb = accepted ? 'approve' : 'reject';
        requests.post(urls.api.url('game.moderate', [gameSlug, statusVerb]))
                .done(function(data) {
                    reviewSubmitted(true);
                }).fail(function(err) {
                    console.error('Failed to submit review; error:', err);
                    reviewSubmitted(false);
                });

        function reviewSubmitted(success) {
            var gameTitle = $game.data('gameTitle');
            var message;
            var params = {game: gameTitle};
            if (success) {
                if (accepted) {
                    message = gettext('Approved game: {game}', params);
                } else {
                    message = gettext('Rejected game: {game}', params);
                }
            } else {
                if (accepted) {
                    message = gettext('Failed to accept game: {game}', params);
                } else {
                    message = gettext('Failed to reject game: {game}', params);
                }
            }
            notification.notification({message: message});

            setSpinning(false);
            if (success) {
                // TODO: Animate this
                $game.remove();

                var $table = $('.review-table');
                if (!$table.find('tbody > tr').length) {
                    $table.hide();
                    $('#empty-message').show();
                }
            }
        }
    }

    z.body.on('click', '.review-accept', function() {
        var $this = $(this);
        var $game = $this.closest('[data-game-slug]');
        submitReview($game, $this, true);
    }).on('click', '.review-reject', function() {
        var $this = $(this);
        var $game = $this.closest('[data-game-slug]');
        submitReview($game, $this, false);
    });

    return function(builder, args) {
        builder.start('admin/review.html');

        builder.z('type', 'leaf review');
        builder.z('title', gettext('Review Queue'));
    };
});
