const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/members';

async function testMemberAPI() {
	try {
		console.log('--- Testing Member API ---');

		// 1. Add Member
		console.log('1. Adding Test Member...');
		const addRes = await axios.post(`${BASE_URL}/add`, {
			firstName: 'John',
			lastName: 'Doe',
			businessName: 'Doe Weddings',
			email: 'john.doe@gmail.com',
			password: 'password123',
			service: 'photographer',
			referralCode: 'REF123'
		});
		console.log('Add Result:', addRes.data.message);

		// 2. Show Members
		console.log('\n2. Listing Members...');
		const listRes = await axios.get(`${BASE_URL}/`);
		const testMember = listRes.data.find(m => m.email === 'john.doe@gmail.com');
		console.log('Found Test Member:', testMember ? 'Yes' : 'No');
		const memberId = testMember._id;

		// 3. Info
		console.log(`\n3. Getting Info for ID: ${memberId}...`);
		const infoRes = await axios.get(`${BASE_URL}/info/${memberId}`);
		console.log('Info Result:', infoRes.data.firstName, infoRes.data.lastName);

		// 4. Toggle Active
		console.log('\n4. Toggling Active...');
		const activeRes = await axios.put(`${BASE_URL}/active/${memberId}`);
		console.log('Toggle Result - New isActive:', activeRes.data.isActive);

		// 5. Delete (Soft Delete)
		console.log('\n5. Deleting Member...');
		const deleteRes = await axios.delete(`${BASE_URL}/delete/${memberId}`);
		console.log('Delete Result:', deleteRes.data.message);

		// 6. Verify Deleted (Listing should filter it)
		console.log('\n6. Verifying Deletion from list...');
		const listRes2 = await axios.get(`${BASE_URL}/`);
		const stillExists = listRes2.data.some(m => m._id === memberId);
		console.log('Still in active list?', stillExists ? 'Yes' : 'No');

		console.log('\n--- Test Completed Successfully ---');
	} catch (err) {
		console.error('Test Failed:', err.response ? err.response.data : err.message);
	}
}

testMemberAPI();
