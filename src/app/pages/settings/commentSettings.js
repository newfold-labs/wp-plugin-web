import AppStore from '../../data/store';
import { webSettingsApiFetch } from '../../util/helpers';
import { useUpdateEffect } from 'react-use';
import { useState } from '@wordpress/element';
import { Alert, Container, SelectField, ToggleField } from "@newfold/ui-component-library";
import { useNotification } from 'App/components/notifications';

const OldPostsComments = ({ setError, notify }) => {
	const { store, setStore } = useContext(AppStore);
	const [disableCommentsOldPosts, setDisableCommentsOldPosts] = useState(
		store.disableCommentsOldPosts
	);

	const disableCommentsNoticeTitle = () => {
		return disableCommentsOldPosts
			? __('Disabled old post comments', 'wp-plugin-web')
			: __('Enabled old post comments', 'wp-plugin-web');
	};

	const disableCommentsNoticeText = () => {
		return disableCommentsOldPosts
			? __('Comments on old posts are disabled.', 'wp-plugin-web')
			: __('Comments are allowed on old posts.', 'wp-plugin-web');
	};

	const toggleDisableCommentsOldPosts = () => {
		webSettingsApiFetch({ disableCommentsOldPosts: !disableCommentsOldPosts }, setError, (response) => {
			setDisableCommentsOldPosts(!disableCommentsOldPosts);
		});
	};

	const notifySuccess = () => {
		notify.push("disable-old-posts-comments-notice", {
			title: disableCommentsNoticeTitle(),
			description: (
				<span>
					{disableCommentsNoticeText()}
				</span>
			),
			variant: "success",
			autoDismiss: 5000,
		});
	};

	useUpdateEffect(() => {
		setStore({
			...store,
			disableCommentsOldPosts,
		});

		notifySuccess();
	}, [disableCommentsOldPosts]);

	return (
		<ToggleField
			id="disable-comments-toggle"
			label={__(
				'Disable comments for older posts',
				'wp-plugin-web'
			)}
			checked={disableCommentsOldPosts}
			onChange={toggleDisableCommentsOldPosts}
			className="nfd-mb-2"
		/>
	);
}

const CloseCommentsDays = ({ setError, notify }) => {
	const { store, setStore } = useContext(AppStore);
	const [closeCommentsDays, setNumCloseCommentsDays] = useState(
		store.closeCommentsDays
	);

	const closeCommentsDaysNoticeTitle = () => {
		return (
			__('Comments setting saved ', 'wp-plugin-web')
		);
	};

	const closeCommentsDaysNoticeText = () => {
		//`Comments on posts are disabled after ${closeCommentsDays} days.`
		return (
			__('Comments on posts are disabled after ', 'wp-plugin-web') +
			closeCommentsDays +
			_n(' day.', ' days.', parseInt(closeCommentsDays), 'wp-plugin-web')
		);
	};

	const closeCommentsDaysLabelText = () => {
		//`Close comments after ${closeCommentsDays} days.`
		return (
			__('Close comments after ', 'wp-plugin-web') +
			closeCommentsDays +
			_n(' day.', ' days.', parseInt(closeCommentsDays), 'wp-plugin-web')
		);
	};

	const handleCloseCommentsDaysChange = (value) => {
		webSettingsApiFetch({ closeCommentsDays: value }, setError, (response) => {
			setNumCloseCommentsDays(value);
		});
	};

	const notifySuccess = () => {
		notify.push("close-comments-days-notice", {
			title: closeCommentsDaysNoticeTitle(),
			description: (
				<span>
					{closeCommentsDaysNoticeText()}
				</span>
			),
			variant: "success",
			autoDismiss: 5000,
		});
	};

	useUpdateEffect(() => {
		setStore({
			...store,
			closeCommentsDays,
		});

		notifySuccess();
	}, [closeCommentsDays]);

	return (
		<SelectField
			id="close-comments-days-select"
			label={closeCommentsDaysLabelText}
			value={closeCommentsDays}
			disabled={store.disableCommentsOldPosts?false:true}
			selectedLabel={closeCommentsDays}
			options={[
				{ label: '1', value: '1' },
				{ label: '3', value: '3' },
				{ label: '5', value: '5' },
				{ label: '7', value: '7' },
				{ label: '10', value: '10' },
				{ label: '14', value: '14' },
				{ label: '20', value: '20' },
				{ label: '28', value: '28' },
				{ label: '30', value: '30' },
				{ label: '50', value: '50' },
				{ label: '100', value: '100' },
			]}
			onChange={handleCloseCommentsDaysChange}
			className="nfd-select-field__spaced"
		/>
	);
}

const CommentsPerPage = ({ setError, notify }) => {
	const { store, setStore } = useContext(AppStore);
	const [commentsPerPage, setNumCommentsPerPage] = useState(
		store.commentsPerPage
	);

	const commentsPerPageNoticeTitle = () => {
		return __('Comments setting saved.', 'wp-plugin-web');
	};

	const commentsPerPageNoticeText = () => {
		//`Posts will display ${commentsPerPage} comments at a time.`
		return (
			__('Posts will display ', 'wp-plugin-web') +
			commentsPerPage +
			_n(
				' comment at a time.',
				' comments at a time.',
				parseInt(commentsPerPage),
				'wp-plugin-web'
			)
		);
	};

	const handleCommentsPerPageChange = (value) => {
		webSettingsApiFetch({ commentsPerPage: value }, setError, (response) => {
			setNumCommentsPerPage(value);
		});
	};

	const notifySuccess = () => {
		notify.push("comments-per-page-notice", {
			title: commentsPerPageNoticeTitle(),
			description: (
				<span>
					{commentsPerPageNoticeText()}
				</span>
			),
			variant: "success",
			autoDismiss: 5000,
		});
	};

	useUpdateEffect(() => {
		setStore({
			...store,
			commentsPerPage,
		});

		notifySuccess();
	}, [commentsPerPage]);

	return (
		<SelectField
			id="comments-per-page-select"
			label={__('Display ', 'wp-plugin-web') + commentsPerPage +
				__(' comments per page.', 'wp-plugin-web')}
			value={commentsPerPage}
			selectedLabel={commentsPerPage}
			options={[
				{ label: '10', value: '10' },
				{ label: '15', value: '15' },
				{ label: '20', value: '20' },
				{ label: '30', value: '30' },
				{ label: '50', value: '50' },
			]}
			onChange={handleCommentsPerPageChange}
			className="nfd-select-field__spaced"
		/>
	);
}

const CommentSettings = () => {
	const [isError, setError] = useState(false);

	let notify = useNotification();
	return (
		<Container.SettingsField
			title={__('Comments', 'wp-plugin-web')}
			description={__('Comments allow visitors to provide feedback and respond to your posts or pages.', 'wp-plugin-web')}
		>
			<div className="nfd-flex nfd-flex-col nfd-gap-4">
				<OldPostsComments setError={setError} notify={notify} />
				<CloseCommentsDays setError={setError} notify={notify} />
				<CommentsPerPage setError={setError} notify={notify} />
				{isError &&
					<Alert variant="error">
						{__('Oops! Something went wrong. Please try again.', 'wp-plugin-web')}
					</Alert>
				}
			</div>
		</Container.SettingsField >
	);
};

export default CommentSettings;