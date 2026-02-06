<?php defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'WPSE_Logger' ) ) {

	class WPSE_Logger {

		private static $instance = null;
		public $directory        = null;
		public $secret_key       = null;
		public $current_job_id   = null;


		private function __construct() {
		}

		function file_expiration_hours() {
			// Expire in 7 days
			return apply_filters( 'vg_sheet_editor/logs/file_expiration_hours', 24 * 7 );
		}

		function get_site_key() {
			if ( $this->secret_key ) {
				return $this->secret_key;
			}
			// We use the secret key to add extra security to the file names
			$this->secret_key = get_option( 'vgse_secret_key' );
			return $this->secret_key;
		}

		function maybe_download_log_file() {
			if ( empty( $_GET['wpseelf'] ) || ! VGSE()->helpers->user_can_manage_options() || empty( $_GET['wpselognonce'] ) || ! wp_verify_nonce( wp_unslash( $_GET['wpselognonce'] ), 'bep-nonce' ) ) {
				return;
			}

			if ( strpos( $_GET['wpseelf'], '.' ) !== false || strpos( $_GET['wpseelf'], '/' ) !== false || strpos( $_GET['wpseelf'], '\\' ) !== false ) {
				die();
			}
			$job_id           = sanitize_file_name( wp_unslash( $_GET['wpseelf'] ) );
			$path             = $this->get_job_file( $job_id );
			$file_name        = current( explode( '.', basename( $path ) ) );
			$public_file_name = str_replace( '-' . $this->get_site_key(), '', $file_name );

			if ( ! file_exists( $path ) ) {
				die( esc_html__( 'The log file does not exist.', 'vg_sheet_editor' ) );
			}

			// output headers so that the file is downloaded rather than displayed
			header( 'Content-type: text/plain' );
			header( "Content-disposition: attachment; filename = $public_file_name.txt" );
			VGSE()->helpers->readfile_chunked( $path );
			die();
		}

		function maybe_create_directories() {
			if ( ! is_dir( $this->directory ) ) {
				wp_mkdir_p( $this->directory );
			}
			if ( ! file_exists( $this->directory . '/index.html' ) ) {
				file_put_contents( $this->directory . '/index.html', '' );
			}
			if ( ! file_exists( $this->directory . '/.htaccess' ) ) {
				file_put_contents( $this->directory . '/.htaccess', 'deny from all' );
			}
		}

		/**
		 * Trims log files to keep only the latest 10,000 lines
		 *
		 * @return void
		 */
		function trim_log_files() {
			$files = VGSE()->helpers->get_files_list( $this->directory, '.txt' );

			foreach ( $files as $file ) {
				// Skip if file is too small to need trimming
				if ( filesize( $file ) < 10485 ) {
					continue;
				}

				// Process file in chunks to avoid loading entire file into memory
				$this->trim_large_file( $file, 10000 );
			}
		}

		/**
		 * Memory-efficient file trimming using buffered reading
		 *
		 * @param string $file Path to the file
		 * @param int $keep_lines Number of lines to keep
		 * @return void
		 */
		function trim_large_file( $file, $keep_lines ) {
			// First pass: count total lines
			$total_lines = 0;
			$handle      = fopen( $file, 'r' );

			if ( ! $handle ) {
				return;
			}

			// Count lines in chunks to avoid loading entire file
			while ( ! feof( $handle ) ) {
				$buffer       = fread( $handle, 8192 );
				$total_lines += substr_count( $buffer, "\n" );
			}
			fclose( $handle );

			// If we don't need to trim, exit early
			if ( $total_lines <= $keep_lines ) {
				return;
			}

			// Calculate how many lines to skip
			$lines_to_skip = $total_lines - $keep_lines;

			// Second pass: copy only the lines we want to keep
			$temp_file     = $file . '.tmp';
			$input_handle  = fopen( $file, 'r' );
			$output_handle = fopen( $temp_file, 'w' );

			if ( ! $input_handle || ! $output_handle ) {
				if ( $input_handle ) {
					fclose( $input_handle );
				}
				if ( $output_handle ) {
					fclose( $output_handle );
				}
				return;
			}

			$current_line = 0;
			while ( ! feof( $input_handle ) && $current_line < $lines_to_skip ) {
				$line = fgets( $input_handle );
				if ( $line !== false ) {
					++$current_line;
				}
			}

			// Copy remaining lines to temp file
			while ( ! feof( $input_handle ) ) {
				$line = fgets( $input_handle );
				if ( $line !== false ) {
					fwrite( $output_handle, $line );
				}
			}

			fclose( $input_handle );
			fclose( $output_handle );

			// Replace original file with trimmed version
			rename( $temp_file, $file );
		}

		function delete_old_files() {
			$files = VGSE()->helpers->get_files_list( $this->directory, '.txt' );
			foreach ( $files as $file ) {
				$expiration_hours = (int) $this->file_expiration_hours();
				if ( file_exists( $file ) && ( time() - filemtime( $file ) > $expiration_hours * 3600 ) ) {
					wp_delete_file( $file );
				}
			}
		}

		function get_log_download_url( $job_id ) {
			$out = null;
			if ( ! empty( $job_id ) ) {
				$out = esc_url_raw(
					add_query_arg(
						array(
							'wpseelf'      => sanitize_file_name( $job_id ),
							'wpselognonce' => wp_create_nonce( 'bep-nonce' ),
						),
						admin_url( 'index.php' )
					)
				);
			}
			return $out;
		}

		function get_job_file( $job_id ) {
			if ( strpos( $job_id, '-' . $this->get_site_key() ) === false ) {
				$job_id .= '-' . $this->get_site_key();
			}
			$file_name = str_replace( array( '.', '/', '\\', ':' ), '', wp_normalize_path( sanitize_file_name( $job_id ) ) );
			$file_path = wp_normalize_path( $this->directory . '/' . $file_name . '.txt' );
			if ( ! file_exists( $file_path ) ) {
				file_put_contents( $file_path, '' );
			}
			return $file_path;
		}

		function set_current_job_id( $job_id ) {
			$this->current_job_id = $job_id;
		}


		function get_caller_info() {
			$backtrace = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 3 );
			if ( isset( $backtrace[2] ) ) {
				$caller  = $backtrace[2];
				$caller2 = $backtrace[1];
				return array(
					'file'     => $caller['file'],
					'line'     => $caller2['line'],
					'function' => $caller['function'],
				);
			}
			return null;
		}
		/**
			* Logs an entry to a specific job's log file.
			*
			* This method writes a log entry to a file associated with a specific job. If no job ID is provided,
			* it uses the current job ID if available. The message can be a string or any type, which will be
			* converted to a string using var_export if necessary. If the job ID is 'auto', the method will
			* automatically determine the job ID based on the caller's file name and prepend the function name
			* and line number to the message.
			*
			* @param mixed     $message The log message to be written. Can be a string or any other type.
			* @param string|int $job_id  Optional. The ID of the job. Can be 'auto' to determine automatically based on the caller's file name and method. Can be 'null' to use the current job id set globally. Defaults to null.
			*
			* @return bool|Logger Returns false if no job ID is provided, otherwise returns the Logger instance.
			*/
		function entry( $message, $job_id = null ) {
			if ( ! $job_id && $this->current_job_id ) {
				$job_id = $this->current_job_id;
			}
			if ( ! $job_id ) {
				return false;
			}
			if ( ! is_string( $message ) ) {
				$message = var_export( $message, true );
			}

			if ( $job_id === 'auto' ) {
				$caller  = $this->get_caller_info();
				$job_id  = pathinfo( $caller['file'], PATHINFO_FILENAME );
				$message = $caller['function'] . ':' . $caller['line'] . PHP_EOL . $message;
			}
			$file_path = $this->get_job_file( $job_id );
			if ( ! file_exists( $file_path ) ) {
				return $this;
			}
			$t     = microtime( true );
			$micro = sprintf( '%06d', ( $t - floor( $t ) ) * 1000000 );

			$time = current_time( 'mysql', true ) . '.' . $micro;

			$message = $this->mask_private_values( $message );

			$fp = fopen( $file_path, 'a' );  // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
			fwrite( $fp, $time . ' (UTC) - ' . html_entity_decode( $message ) . PHP_EOL . PHP_EOL ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fwrite
			fclose( $fp ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
			return $this;
		}

		function mask_private_values( $message ) {
			// Regex pattern to match a UUID
			$pattern = '/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/';

			// Apply the replacement
			$message = preg_replace_callback(
				$pattern,
				function ( $matches ) {
					return substr( $matches[0], 0, -10 ) . 'xxxxxxxxxx';
				},
				$message
			);
			return $message;
		}

		function debug( $variables ) {
			$job_id    = 'debug';
			$file_path = $this->get_job_file( $job_id );
			if ( ! file_exists( $file_path ) ) {
				return $this;
			}
			$args        = func_get_args();
			$trace       = debug_backtrace( DEBUG_BACKTRACE_IGNORE_ARGS, 3 );
			$caller_info = $trace[0];
			$file        = str_replace( wp_normalize_path( WP_CONTENT_DIR ), '', wp_normalize_path( $caller_info['file'] ) );

			$function = $trace[1]['function'];
			$line     = $caller_info['line'];

			$message = "$file : $function > Line $line - " . var_export( $args, true );

			$t     = microtime( true );
			$micro = sprintf( '%06d', ( $t - floor( $t ) ) * 1000000 );

			$time = current_time( 'mysql' ) . '.' . $micro;

			$fp = fopen( $file_path, 'a' );  // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
			fwrite( $fp, $time . ' - ' . html_entity_decode( wp_kses_post( $message ) ) . PHP_EOL . PHP_EOL ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fwrite
			fclose( $fp ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
			return $this;
		}


		function init() {
			$this->directory = apply_filters( 'vg_sheet_editor/logs/directory', WP_CONTENT_DIR . '/uploads/wp-sheet-editor/logs' );
			add_action( 'wpse_daily_cron', array( $this, 'delete_old_files' ) );
			add_action( 'wpse_daily_cron', array( $this, 'trim_log_files' ) );
			if ( is_admin() ) {
				$this->maybe_create_directories();
				add_action( 'vg_sheet_editor/initialized', array( $this, 'maybe_download_log_file' ) );
				add_action( 'vg_sheet_editor/editor/before_init', array( $this, 'register_toolbar' ), 80 );
			}
			register_shutdown_function( array( $this, 'log_errors' ) );
		}
		function register_toolbar( $editor ) {

			$post_types = $editor->args['enabled_post_types'];
			foreach ( $post_types as $post_type ) {
				$editor->args['toolbars']->register_item(
					'error_log',
					array(
						'type'                  => 'button',
						'allow_in_frontend'     => false,
						'content'               => esc_html__( 'Error log', 'vg_sheet_editor' ),
						'toolbar_key'           => 'secondary',
						'extra_html_attributes' => 'data-remodal-target="modal-error-log"',
						'parent'                => 'support',
						'footer_callback'       => array( $this, 'render_error_log_modal' ),
						'required_capability'   => 'manage_options',
					),
					$post_type
				);
			}
		}

		function get_last_n_lines( $job_id, $max_lines = 100 ) {
			$file_path = $this->get_job_file( $job_id );
			$lines     = array();

			if ( file_exists( $file_path ) ) {
				$handle = fopen( $file_path, 'r' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
				if ( $handle ) {
					$pos   = -2;
					$t     = ' ';
					$lines = array();

					fseek( $handle, 0, SEEK_END );
					$file_size = ftell( $handle );

					while ( count( $lines ) <= $max_lines && $file_size > abs( $pos ) ) {
						fseek( $handle, $pos, SEEK_END );
						$char = fgetc( $handle );
						if ( $char === "\n" || $char === "\r" ) {
							if ( ! empty( trim( $t ) ) ) {
								$lines[] = trim( $t );
							}
							$t = '';
						} else {
							$t = $char . $t;
						}
						$pos--;
					}

					if ( ! empty( trim( $t ) ) ) {
						$lines[] = trim( $t );
					}
					fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
					$lines = array_reverse( $lines );
				}
			}
			return $lines;
		}
		function render_error_log_modal() {
			$errors_string = implode( PHP_EOL, $this->get_last_n_lines( 'error_log', 500 ) );
			// Split the log string into individual error entries based on the double newline separator.
			$error_entries = array_filter( array_map( 'trim', preg_split( '/\n\s*\n/', $errors_string ) ) );
			?>
			<div data-remodal-id="modal-error-log" data-remodal-options="closeOnOutsideClick: false"
				class="remodal remodal-error-log modal-error-log remodal-extra-large">

				<h2><?php esc_html_e( 'Error log', 'vg_sheet_editor' ); ?></h2>
				<?php if ( empty( $error_entries ) ) { ?>
					<p><?php esc_html_e( 'We haven\'t detected any fatal errors yet.', 'vg_sheet_editor' ); ?></p>
				<?php } else { ?>
					<p>
					<?php
						/* translators: %d: Number of days after which the log file expires */
						printf( esc_html__( 'Here you can see the fatal errors related to WP Sheet Editor. If you experience any error while using WP Sheet Editor, you can see if any entry appears below with a related date and time, and send the full error message to the WP Sheet Editor support team. This log is reset every %d days.', 'vg_sheet_editor' ), (int) $this->file_expiration_hours() / 24 );
					?>
						</p>
						<ul class="wpse-error-log-list">
						<?php
						foreach ( $error_entries as $entry ) :
							// Separate the main message from the stack trace
							$parts   = preg_split( '/\nStack trace:/', $entry, 2 );
							$message = trim( $parts[0] );
							$trace   = isset( $parts[1] ) ? trim( $parts[1] ) : '';
							?>
								<li x-data="{ showTrace: false }">
									<span><?php echo esc_html( $message ); ?></span>
								<?php if ( $trace ) : ?>
										<button class="button" @click="showTrace = !showTrace" x-text="showTrace ? vgse_editor_settings.texts.hide_trace : vgse_editor_settings.texts.show_trace"></button>
										<pre x-show="showTrace" x-transition><?php echo esc_html( "Stack trace:\n" . $trace ); ?></pre>
								<?php endif; ?>
								</li>
							<?php endforeach; ?>
						</ul>
				<?php } ?>
				<button data-remodal-action="confirm" class="remodal-cancel"><?php esc_html_e( 'Close', 'vg_sheet_editor' ); ?></button>
			</div>
					<?php
		}


		/**
		 * Ensures fatal errors are logged so they can be picked up in the status report.
		 *
		 * @since 2.25.6
		 */
		public function log_errors() {
			$error = error_get_last();
			if ( $error && in_array( $error['type'], array( E_ERROR, E_PARSE, E_COMPILE_ERROR, E_USER_ERROR, E_RECOVERABLE_ERROR ), true ) && preg_match( '/(Fatal|Uncaught Error|sheet-editor|bulk-edit-events|bulk-edit-posts-on-frontend|bulk-edit-categories-tags|bulk-edit-user-profiles-in-spreadsheet|woo-coupons-bulk-editor|woo-bulk-edit-products|woo-products-bulk-editor)/', $error['message'] ) ) {
				/* translators: %1$s: Error message, %2$s: File path, %3$s: Line number */
				$this->entry( sprintf( esc_html__( '%1$s in %2$s on line %3$s', 'vg_sheet_editor' ), $error['message'], $error['file'], $error['line'] ), 'error_log' );
			}
		}

		/**
		 * Creates or returns an instance of this class.
		 */
		static function get_instance() {
			if ( null == self::$instance ) {
				self::$instance = new WPSE_Logger();
				self::$instance->init();
			}
			return self::$instance;
		}

		function __set( $name, $value ) {
			$this->$name = $value;
		}

		function __get( $name ) {
			return $this->$name;
		}
	}

}

if ( ! function_exists( 'WPSE_Logger_Obj' ) ) {

	/**
	 * @return WPSE_Logger
	 */
	function WPSE_Logger_Obj() {
		return WPSE_Logger::get_instance();
	}
}
WPSE_Logger_Obj();
