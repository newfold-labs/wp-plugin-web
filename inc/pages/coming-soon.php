<?php
/**
 * This template renders a coming soon page when the coming soon feature is active.
 *
 * @package WPPluginWeb
 */

?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
	<head>
		<meta name="viewport" content="width=device-width">
		<title>
			<?php
			printf(
			/* translators: %s: Blog name */
				__( '%s &mdash; Coming Soon', 'wp-plugin-web' ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				esc_html( get_option( 'blogname' ) )
			);
			?>
		</title>
		<meta name="robots" content="noindex, nofollow" />
		<script
			src="<?php echo esc_url( includes_url( 'js/jquery/jquery.js' ) ); //phpcs:ignore WordPress.WP.EnqueuedResources.NonEnqueuedScript ?>"></script>
		<style type="text/css">
			:root {
				--mdc-theme-primary: #0D47FB;
				--mdc-theme-extra: #BD2380;
				--dc-theme-black: #000000;
				--dc-theme-grey: #353738;
				--dc-theme-grey-dark: #1F2044;
				--dc-theme-white: #ffffff;
				--mdc-theme-error: #ff182f;
				--mdc-theme-error--dark: #701116;
				--dc-theme-success: #23c161;
				--dc-theme-success--dark: #034a1d;

			}
			* {
				box-sizing: border-box;
				-moz-box-sizing: border-box;
				-webkit-box-sizing: border-box;
			}

			body {
				background-color: var(--dc-theme-white);
				color: var(--dc-theme-grey-dark);
				overflow-x: hidden;
				margin: 0;
			}

			body,
			input {
				font-family: "Open Sans",sans-serif;
			}

			#wrap {
				align-items: center;
				display: flex;
				justify-content: center;
				min-height: 100vh;
			}

			.content {
				background-image: url("<?php echo esc_url( WEB_PLUGIN_URL . 'assets/images/coming-soon.png' ); ?>");
				background-position: center top;
				background-repeat: no-repeat;
				background-size: 345px 239px;
				flex: 1;
				margin: auto 5%;
				padding: 250px 0 0;
				text-align: center;
				max-width: 420px;
			}

			#wrap h1 {
				color: var(--dc-theme-black);
				font-weight: 600;
				font-family: 'Noto Serif', serif;;
				font-size: 28px;
				letter-spacing: 0.15px;
				line-height: 36px;
			}

			#wrap h2 {
				color: var(--dc-theme-grey-dark);
				font-size: 14px;
				font-weight: 700;
				line-height: 18px;
				letter-spacing: 0.75px;
				text-transform: uppercase;
			}

			footer {
				width: 100%;
				position: fixed;
				bottom: 0;
				left: 0;
			}

			footer p {
				font-size: 14px;
				line-height: 22px;
				color: var(--dc-theme-grey);
				padding: 8px;
				text-align: center;
			}

			footer p a {
				color: var(--mdc-theme-primary);
				text-decoration: none;
			}

			footer p a:hover {
				text-decoration: underline;
			}

			.btn {
				background: var(--mdc-theme-extra);
				background-image: none;
				border: 5px solid var(--mdc-theme-extra);
				box-shadow: none;
				color: var(--dc-theme-white);
				cursor: pointer;
				display: inline-block;
				font-size: 14px;
				font-weight: 400;
				line-height: 1.5;
				padding: 6px 30px;
				text-align: center;
				text-decoration: none;
				touch-action: manipulation;
				transition: all 0.2s ease;
				user-select: none;
				vertical-align: middle;
				white-space: nowrap;
			}

			.btn:hover {
				background-color: var(--dc-theme-white);
				border-color: var(--mdc-theme-extra);
				color: var(--mdc-theme-extra);
			}

			.web_subscription_widget #subscribe-text p {
				line-height: 24px;
				margin-bottom: 25px;
			}

			.web_subscription_widget #success,
			.web_subscription_widget #error {
				border-radius: 4px;
				font-size: 14px;
				line-height: 24px;
				color: var(--dc-theme-grey);
				margin-bottom: 25px;
				display: none;
				padding: 8px 40px;
			}

			.web_subscription_widget #success {
				background: var(--dc-theme-success);
				border: 1px solid var(--dc-theme-success--dark);
			}

			.web_subscription_widget #error {
				background: var(--dc-theme-error);
				border: 1px solid var(--dc-theme-error--dark);
			}

			.web_subscription_widget form .web-inputs {
				display: inline-block;
				position: relative;
				vertical-align: middle;
				transition: all 0.1s ease;
			}

			.web_subscription_widget form .web-inputs label {
				display: none;
			}

			.web_subscription_widget form .web-inputs.email input[type="email"] {
				background-color: var(--dc-theme-white);
				border: 1px solid var(--dc-theme-grey);
				color: var(--dc-theme-grey-dark);
				font-size: 11px;
				min-width: 240px;
				padding: 14px 15px;
				max-height: 45px;
				transition: all 0.05s ease;
			}

		</style>
	</head>
	<body>
		<div id="wrap">
			<main class="content">
				<div class="web_subscription_widget">
					<h1><?php esc_html_e( 'Coming soon', 'wp-plugin-web' ); ?></h1>
					<?php if ( class_exists( 'Jetpack' ) && Jetpack::is_module_active( 'subscriptions' ) ) { ?>
						<div id="subscribe-text">
							<p><?php esc_html_e( 'Be the first to know when we launch, enter your email address and we will let you know when we go live and any future website updates we have.', 'wp-plugin-web' ); ?></p>
						</div>
						<div id="success">
							<?php esc_html_e( 'Thank you, please check your email to confirm your subscription.', 'wp-plugin-web' ); ?>
						</div>
						<div id="error">
							<?php esc_html_e( 'There was an error with your submission and you were not subscribed. Please try again with a different email address.', 'wp-plugin-web' ); ?>
						</div>
						<form action="" method="post" accept-charset="utf-8" id="subscribe-web">
							<input type="hidden" name="action" value="mojo_coming_soon_subscribe">
							<?php wp_nonce_field( 'mojo_coming_soon_subscribe_nonce', 'mm_nonce-coming-soon-subscribe' ); ?>
							<span class="web-inputs email" id="subscribe-email">
								<label id="web-subscribe-label" for="subscribe-field-web">
									<?php esc_html_e( 'Email', 'wp-plugin-web' ); ?>
								</label>
								<input
									type="email"
									name="email"
									required="required"
									value=""
									id="subscribe-field-web"
									placeholder="Enter your email address"
								>
							</span>
							<span class="web-inputs submit" id="subscribe-submit">
								<input class="btn" type="submit" value="Subscribe" name="web_subscriptions_widget">
							</span>
						</form>
						<?php } else { // endif ?>
							<h2><?php esc_html_e( 'A New WordPress Site', 'wp-plugin-web' ); ?></h2>
						<?php } // end else ?>
					</div>
			</main>
		</div>
		<footer>
			<p class="text-center">
				<?php
				$wordpress_hosting_page = 'https://www.web.com/websites/wordpress';
				$my_panel               = 'https://www.web.com/my-account/account-center/login';
				printf(
				/* translators: %1$s is replaced with opening link tag taking you to web.com/wordpress, %2$s is replaced with closing link tag */
					esc_html__( 'A %1$sWeb.com%2$s powered website.', 'wp-plugin-web' ) . '&nbsp;',
					'<a href="' . esc_url( $wordpress_hosting_page ) . '" class="web" target="_blank" rel="noopener noreferrer nofollow">',
					'</a>'
				);
				printf(
				/* translators: %1$s is replaced with opening link tag taking you to login page, %2$s is replaced with opening link tag taking you to my.web.com, %3$s is replaced with closing link tag */
					esc_html__( 'Is this your website? Log in to %1$sWordPress%3$s or %2$sWeb.com%3$s.', 'wp-plugin-web' ),
					'<a href="' . esc_url( wp_login_url() ) . '">',
					'<a href="' . esc_url( $my_panel ) . '" class="web" target="_blank" rel="noopener noreferrer nofollow">',
					'</a>'
				);
				?>
			</p>
		</footer>
		<script>
			jQuery(document).ready(function ($) {

				$('#subscribe-submit input').click(function (e) {
					e.preventDefault();

					$('#success').hide();
					$('#error').hide();

					var email = $('#subscribe-field-web').val();
					var nonce = $('#mm_nonce-coming-soon-subscribe').val();
					var ajaxscript = {ajax_url: '<?php echo esc_url( admin_url() ); ?>admin-ajax.php'}

					$.ajax({
						type: 'POST',
						url: ajaxscript.ajax_url,
						data: {
							'action': 'mojo_coming_soon_subscribe',
							'email': email,
							'nonce': nonce
						},
						success: function (response) {
							var status = response.status;
							if (status == 'success') {
								$('#success').show();
							} else if (status == 'active') {
								$('#error').show().text('<?php echo esc_js( __( 'Your email address is already subscribed to this website. Stay tuned to your inbox for our updates or try a different email address.', 'wp-plugin-web' ) ); ?>');
							} else if (status == 'invalid_email') {
								$('#error').show().text('<?php echo esc_js( __( 'There was an error with your submission and you were not subscribed. Please try again with a valid email address.', 'wp-plugin-web' ) ); ?>');
							} else {
								$('#error').show();
							}
						},
					});
				});

			});
		</script>
	</body>
</html>
