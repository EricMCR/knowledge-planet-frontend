import axios from 'axios'
import store from '@/store'

const request = axios.create({
    baseURL: '/api',
    headers: {
        token: store.state.token
    },
    timeout: 50000
});

request.interceptors.response.use(function (response) {
    if ((typeof response.data) == 'string') {
        response.data = {
            status: '403'
        }
    }
    return response;
});

export default request;