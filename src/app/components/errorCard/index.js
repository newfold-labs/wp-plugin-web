import './stylesheet.scss';
import { Title } from '@newfold/ui-component-library';
import { dispatchUpdateSnackbar } from '../../util/helpers';
import {
	Card,
	CardBody,
	CardHeader,
	CardFooter,
	Dashicon,
} from '@wordpress/components';

const ErrorCard = ({ error, className, notice = 'Error!' }) => {
	dispatchUpdateSnackbar(notice);

	return (
		<Card className={classNames('error-card', className)}>
			<CardHeader>
				<Title as="h3">
					<Dashicon
						icon="warning"
						style={{
							fontSize: '24px',
							width: '24px',
							height: '24px',
						}}
					/>{' '}
					{__('Oh No, An Error!', 'wp-plugin-web')}
				</Title>
			</CardHeader>
			<CardBody>
				<p>
					{__(
						'You found an error, please refresh the page and try again!',
						'wp-plugin-web'
					)}
				</p>
				<p>
					{__(
						'If the error persists, please contact support.',
						'wp-plugin-web'
					)}
				</p>
			</CardBody>
			<CardFooter>
				<p>
					{error && error.message ? error.message : ''}
					{error && error.data
						? __(' Error code: ', 'wp-plugin-web') +
						  error.data.status
						: ''}
				</p>
			</CardFooter>
		</Card>
	);
};

export default ErrorCard;
