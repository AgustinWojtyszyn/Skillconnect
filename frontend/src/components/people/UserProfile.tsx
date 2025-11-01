import React from 'react';

interface UserProfileProps {
	userId: string;
	onBack: () => void;
	onStartChat: (userId: string, username: string) => void;
	onOpenUser: (id: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
	userId,
	onBack,
	onStartChat,
	onOpenUser
}) => {
	return (
		<div className="bg-white rounded-lg shadow p-6">
			<button
				onClick={onBack}
				className="mb-4 text-blue-600 hover:text-blue-800"
			>
				← Back
			</button>
			<h2 className="text-2xl font-bold mb-4">User Profile</h2>
			<p>User ID: {userId}</p>
			{/* Add your user profile implementation here */}
		</div>
	);
};
