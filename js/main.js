async function checkPort(port) {
    try {
        const response = await fetch(`http://127.0.0.1:${port}/base/ping`);
        if (response.ok) {
            return port; // 返回成功的端口号
        }
        throw new Error(`Port ${port} not available`);
    } catch (error) {
        throw new Error(`Port ${port} not accessible`); // 显式抛出错误
    }
}
let successfulPort=14250;
async function findOpenPort() {
    const portRange = Array.from({ length: 11 }, (_, i) => 14250 + i); // 14250 到 14260
    const portChecks = portRange.map(port => checkPort(port)); // 创建检查所有端口的 Promise 数组

    try {
        successfulPort = await Promise.any(portChecks); // 并发检查所有端口
        console.log(`成功的端口是: ${successfulPort}`);
        checkAuthStatus();
    } catch {
        const dialog = document.querySelector('.Localserver_Error');
        dialog.open = true;
        successfulPort=null;
        console.log("没有找到可访问的端口。");
    }
}

function main(){
    fetchAndDisplayItems();
    displayMeInformation();
    fetchAccounts();
    insertRemarks();
    reloadData();
}
async function checkAuthStatus_lite() {
    if (successfulPort == null) {
        findOpenPort();
        const dialog = document.querySelector('.Localserver_Error');
        dialog.open = true;
        return;
    }
    
    try {

        // 向指定接口发送 GET 请求
        const response = await fetch(`http://127.0.0.1:${successfulPort}/auth/status`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.data === true) {
            checkAuthStatus();
            showPage('login');
            main();
        } else {
            const dialog = document.querySelector('.Prisma_Login');
            dialog.open = true;
        }

        // 手动初始化动态组件
        document.querySelectorAll('.mdui-collapse').forEach((el) => {
            new mdui.Collapse(el);
        });
    } catch (error) {
        console.error('Error fetching auth status:', error);
    }
}

function Prisma_Login(username, password) {
    const wait_dialog = document.querySelector('.Wait_Zha_Pian_User');
    wait_dialog.open = true;
    fetch(`http://127.0.0.1:${successfulPort}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.code === 0) {  // 根据需求，将 code === 0 判断为登录成功
            const dialog_ = document.querySelector('.Prisma_Login');
            dialog_.open = false;
            const dialog = document.getElementById('register_success');
            dialog.headline="登录成功"
            dialog.description="现在你可以开始使用Prisma NEL";
            dialog.open=true;
            checkAuthStatus();
            main();
        } else {
            console.log('登录失败:', data.message || '未知错误');
            const dialog = document.getElementById('register_success');
            dialog.headline="登录失败"
            dialog.description=data.msg;
            dialog.open=true;
        }
    })
    .catch(error => {
        console.error('请求失败:', error);
        const dialog = document.getElementById('register_success');
            dialog.headline="登录失败·未知错误"
            dialog.description=error;
            dialog.open=true;
    });
    wait_dialog.open = false;
}


async function checkAuthStatus() {
    try {
        // 向指定接口发送 GET 请求
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/auth/status');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // 查找现有的 <mdui-navigation-drawer> 元素
        const navigationDrawer = document.querySelector('mdui-navigation-drawer');
        if (!navigationDrawer) {
            console.error('Navigation drawer element not found');
            return;
        }

        // 根据接口返回的数据，替换内容
        if (result.data === true) {
            navigationDrawer.innerHTML = `
                <mdui-list>
                    <mdui-collapse accordion>
                        <mdui-collapse-item>
                            <mdui-list-item slot="header" icon="home" onclick="showPage('home')">主页</mdui-list-item>
                        </mdui-collapse-item>
                        <mdui-collapse-item>
                            <mdui-list-item slot="header" icon="account_circle" onclick="showPage('login')">账号管理</mdui-list-item>
                        </mdui-collapse-item>
                        <mdui-collapse-item>
                            <mdui-list-item slot="header" icon="auto_awesome_motion">服务器管理</mdui-list-item>
                            <div style="margin-left: 2.5rem">
                                <mdui-list-item onclick="showPage('Network_Server')">网络服列表</mdui-list-item>
                                <mdui-list-item onclick="showPage('Rental_server')">租聘服列表</mdui-list-item>
                            </div>
                        </mdui-collapse-item>
                        <mdui-collapse-item>
                            <mdui-list-item slot="header" icon="add_road" onclick="showPage('daili')">代理管理</mdui-list-item>
                        </mdui-collapse-item>
                        <mdui-collapse-item>
                            <mdui-list-item slot="header" icon="shopping_cart" onclick="showPage('shopping')">商城</mdui-list-item>
                        </mdui-collapse-item>
                        <mdui-collapse-item>
                            <mdui-list-item slot="header" icon="account_circle" onclick="showPage('me')">我</mdui-list-item>
                        </mdui-collapse-item>
                    </mdui-collapse>
                </mdui-list>
            `;
            
            main();
        } else {
            navigationDrawer.innerHTML = `
                <mdui-list>
                    <mdui-collapse accordion>
                        <mdui-collapse-item>
                            <mdui-list-item slot="header" icon="home" onclick="showPage('home')">主页</mdui-list-item>
                        </mdui-collapse-item>
                        
                    </mdui-collapse>
                </mdui-list>
            `;
        }

        // 手动初始化动态组件
        document.querySelectorAll('.mdui-collapse').forEach((el) => {
            new mdui.Collapse(el);
        });
    } catch (error) {
        console.error('Error fetching auth status:', error);
    }
}

async function getUserInfo() {
    try {
        const response = await fetch(`http://127.0.0.1:${successfulPort}/auth/userinfo`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const result = await response.json();
        if (result.code === 0) {
            const { username, userId } = result.data;
            console.log(`Username: ${username}, UserId: ${userId}`);

            return { username, userId };
        } else {
            throw new Error(`Error: ${result.msg}`);
        }

    } catch (error) {
        console.error('Error fetching user info:', error);
    }
}
async function getPermissionInfo() {
    try {
        const response = await fetch(`http://127.0.0.1:${successfulPort}/auth/permission`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        if (result.code === 0) {
            const permissions = result.data;
            permissions.forEach(permission => {
                const { permissionId, usageDeadline } = permission;
                console.log(`Permission ID: ${permissionId}, Usage Deadline: ${usageDeadline}`);
            });
            return permissions.map(({ permissionId, usageDeadline }) => ({ permissionId, usageDeadline }));
        } else {
            throw new Error(`Error: ${result.msg}`);
        }

    } catch (error) {
        console.error('Error fetching permission info:', error);
    }
}
async function getRoleInfo() {
    try {
        const response = await fetch(`http://127.0.0.1:${successfulPort}/auth/role`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        if (result.code === 0) {
            const roleId = result.data.roleId;
            
            const roleMap = {
                0: 'SuperAdmin',
                1: 'Admin',
                2: 'Reseller',
                3: 'User',
                4: 'User_Relax',
                5: 'Banned'
            };
            const roleName = roleMap[roleId] || 'Unknown Role';
            console.log(`Role ID: ${roleId}, Role Name: ${roleName}`);
            return roleName;
        } else {
            throw new Error(`Error: ${result.msg}`);
        }

    } catch (error) {
        console.error('Error fetching role info:', error);
    }
}
async function getWalletBalance() {
    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/wallet/balance/get', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        if (result.code === 0) {
            const balance = result.data;
            console.log(`Wallet Balance: ${balance}`);
            return balance;
        } else {
            throw new Error(`Error: ${result.msg}`);
        }

    } catch (error) {
        console.error('Error fetching wallet balance:', error);
    }
}
function Activate(){
    const dialog= document.querySelector('.Activate_Card');
    dialog.open=true;
}
function Activate_CardPress(card){
    const wait_dialog = document.querySelector('.Wait_Zha_Pian_User');
    wait_dialog.open = true;
    fetch(`http://127.0.0.1:${successfulPort}/wallet/balance/add`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code: card
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.code === 0) {
            displayMeInformation();
            const _dialog= document.querySelector('.Activate_Card');
            _dialog.open=false;
            const dialog = document.querySelector('.Activate_successful');
            dialog.open = true;
            console.log('激活成功:', data.message);
            
        } else {
            console.log('登录失败:', data.message || '未知错误');
        }
    })
    .catch(error => {
        console.error('请求失败:', error);
    });
    wait_dialog.open = false;
}
let money_man=false;
async function displayMeInformation() {
    try {
        const userInfo = await getUserInfo();
        const permissionInfo = await getPermissionInfo();
        const roleName = await getRoleInfo();
        const balance = await getWalletBalance();
        const meInfoDiv = document.querySelector('.Me_Information');
        meInfoDiv.innerHTML = '';
        const card = document.createElement('mdui-card');
        card.className = 'Me_Information_Card';
        card.setAttribute('variant', 'outlined');
        const h1 = document.createElement('h1');
        h1.className = 'Title_Sub_Low_Top';
        h1.textContent = userInfo.username;
        const mduiList = document.createElement('mdui-list');
        const roleItem = document.createElement('mdui-list-item');
        roleItem.setAttribute('headline', `权限等级: ${roleName}`);
        const balanceItem = document.createElement('mdui-list-item');
        balanceItem.setAttribute('headline', '账户余额:');
        balanceItem.setAttribute('description', `${balance} RB`);
        const permission = permissionInfo[0];
        const deadlineItem = document.createElement('mdui-list-item');
        console.log(permission);
        if (permission == null) {
            deadlineItem.setAttribute('headline', '到期时长:');
            deadlineItem.setAttribute('description', "您还没有购买时长");
            money_man=false;
        }else{
            deadlineItem.setAttribute('headline', '到期时长:');
            deadlineItem.setAttribute('description', permission.usageDeadline);
            money_man=true;
        }

        const kami = document.createElement('mdui-list-item');
        kami.setAttribute('headline', '激活卡密');
        kami.setAttribute('description', '---激活在卡网购买的充值码---');
        kami.setAttribute('onclick', `Activate()`);
        mduiList.appendChild(roleItem);
        mduiList.appendChild(balanceItem);
        mduiList.appendChild(deadlineItem);
        mduiList.appendChild(kami);
        card.appendChild(h1);
        card.appendChild(mduiList);
        meInfoDiv.appendChild(card);
    } catch (error) {
        console.error('Error displaying user information:', error);
    }
}
async function fetchAndDisplayItems() {
    try {
        // 发送 GET 请求
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/balance/items', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();

        // 检查返回结果的 code 是否为 0
        if (result.code === 0) {
            const items = result.data;
            const shoppingList = document.querySelector('.shopping_list');

            // 清空之前的内容
            shoppingList.innerHTML = '';

            // 遍历每个 item，创建相应的 mdui-list-item
            items.forEach(item => {
                const { itemId, name, description, price } = item;

                // 创建 <mdui-list-item> 元素
                const listItem = document.createElement('mdui-list-item');
                listItem.classList.add('rounded');
                listItem.setAttribute('alignment', 'start');
                listItem.setAttribute('description', `${description} - 价格: ${price} RB`);
                listItem.setAttribute('onclick', `buy_items(${itemId},'${description}',${price})`);
                // 设置标题和内容
                listItem.innerHTML = `
                    ${name}
                    <mdui-icon slot="icon" name="attach_money"></mdui-icon>
                `;

                // 将 listItem 添加到 mdui-list
                shoppingList.appendChild(listItem);
            });
        } else {
            throw new Error(`Error: ${result.msg}`);
        }

    } catch (error) {
        console.error('Error fetching items:', error);
    }
}
let Cache_item_id=0;
function buy_items(itemId,description,price) {
    Cache_item_id=itemId;
    const dialog = document.querySelector('.buy_item');
    dialog.description = "你确定要购买"+description+"吗？价格为："+price+"RB";
    dialog.headline="确定购买商品"+itemId+"吗？"
    dialog.open = true;
}
async function buy_items_true(itemId) {
    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+`/balance/item/purchase/${itemId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.code === 0) {
            const msg = result.msg;
            console.log(`购买成功: ${msg}`);
            document.querySelector('.buy_item').open = false;
            document.querySelector('.Quanqian_success').open = true
            displayMeInformation();

        } else {
            throw new Error(`Error: ${result.msg}`);
        }

    } catch (error) {
        console.error('Error fetching wallet balance:', error);
    }
}

let cache_;
function handleLogin(account, password,deviceID = null, deviceKey = null) {
    let url;
    let data;
    let model;
    model=0;
    if (account.includes('sauth_json')) {
        url = 'http://127.0.0.1:'+successfulPort+'/netease/auth/sauth';
        data = JSON.stringify({ sauth: account });
        model=4562;
    } else if (account.includes('@')) {
        url = 'http://127.0.0.1:'+successfulPort+'/netease/auth/offical';
        data = JSON.stringify({ account: account, password: password,deviceID:deviceID, deviceKey:deviceKey });
        model=163;
    } else {
        url = 'http://127.0.0.1:'+successfulPort+'/netease/auth/4399';
        data = JSON.stringify({ account: account, password: password });
        model=4399;
    }
    console.log(url, data);
    fetch(url, {
        method: 'POST',
        headers: {
            'accept': 'text/plain',
            'Content-Type': 'application/json'
        },
        body: data
    })
    .then(response => response.json())
    .then(return_data => {
        let return_data_data=return_data.data;
        cache_deviceID=return_data_data.deviceID;
        cache_deviceKey=return_data_data.deviceKey;
        if (return_data.code == 0) {
            cache_=JSON.stringify({ account: account, password: password,deviceID:cache_deviceID, deviceKey:cache_deviceKey })
            document.querySelector(".Dialog_Login").open = false;
            const dialog = document.querySelector(".Dialog_Login_Success");
            dialog.open = true;
            insertRemarks();
        } else {
            console.error('Login failed:'+return_data.msg);
        } 
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
function gotobuy(){
    window.open("https://shop.prisma.today");
}
function remark_save(remark) {
    let url;
    let data;
    let model;
    model=0;
    console.log(cache_);
    if (cache_ == null) {
        return;
    }
    let cache_account=JSON.parse(cache_);
    if (cache_account.account.includes('sauth_json')) {
        url = 'http://127.0.0.1:'+successfulPort+'/sauth/add';
        let encodedAccount = btoa(cache_account.account);
        data = JSON.stringify({ remark:remark, sauth: encodedAccount });
        model=4562;
    } else if (cache_account.account.includes('@')) {
        url = 'http://127.0.0.1:'+successfulPort+'/official/add';
        console.log(cache_account.deviceID);
        data = JSON.stringify({ remark:remark, account: cache_account.account, password: cache_account.password,deviceID:cache_account.deviceID, deviceKey:cache_account.deviceKey });
        model=163;
    } else {
        url = 'http://127.0.0.1:'+successfulPort+'/4399/add';
        data = JSON.stringify({ remark:remark, account: cache_account.account, password: cache_account.password });
        model=4399;
    }
    console.log(url, data);
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        if (data.code == 0) {
            const dialog = document.querySelector(".Dialog_Login_Success");
            dialog.open = false;
            insertRemarks();
        } else {
            console.error('Login failed:'+data.msg);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function reloadData() {
    try {
        const response = fetch('http://127.0.0.1:'+successfulPort+'/reload');
        const data = response.json();
        
        if (data.msg !== 'Success') {
            console.error('Error:', data.msg);
        }
    } catch (error) {
        console.error('Failed to fetch reload data:', error);
    }
}

let officialData = [];
async function fetchOfficialData() {
    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/official/get');
        const data = await response.json();

        if (data.code === 0) {
            officialData = data.data;
        } else {
            console.error('Failed to fetch official data:', data.msg);
        }
    } catch (error) {
        console.error('Failed to fetch official data:', error);
    }
}

let data4399 = [];
async function fetch4399Data() {
    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/4399/get');
        const data = await response.json();

        if (data.code === 0) {
            data4399 = data.data;
        } else {
            console.error('Failed to fetch 4399 data:', data.msg);
        }
    } catch (error) {
        console.error('Failed to fetch 4399 data:', error);
    }
}

let sauthData = [];
async function fetchSauthData() {
    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/sauth/get');
        const data = await response.json();

        if (data.code === 0) {
            sauthData = data.data;
        } else {
            console.error('Failed to fetch sauth data:', data.msg);
        }
    } catch (error) {
        console.error('Failed to fetch sauth data:', error);
    }
}
let combinedData=[];
async function insertRemarks() {
    await Promise.all([fetchOfficialData(), fetch4399Data(), fetchSauthData()]);

    combinedData = [...officialData, ...data4399, ...sauthData];

    const selectElement = document.querySelector('.Account_multiple');
    selectElement.innerHTML = '';
    console.log(combinedData);
    combinedData.forEach(item => {
        const option = document.createElement('mdui-menu-item');
        option.value = item.remark;
        option.textContent = item.remark;
        selectElement.appendChild(option);
    });
}
let cache_deviceID="";
let cache_deviceKey="";

async function compareAndPost(compareArray) {
    const wait_dialog = document.querySelector('.Wait_Zha_Pian_User');
    wait_dialog.open = true;
    const loginResults = [];
    for (const compareItem of compareArray) {
        const match = combinedData.find(item => item.remark === compareItem);

        if (match) {
            let postUrl = '';
            let postData = {};
            let remark = match.remark;

            // 判断数据来源是 official, 4399 还是 sauth
            if (officialData.includes(match)) {
                model='official';
                postUrl = 'http://127.0.0.1:'+successfulPort+'/netease/auth/offical';
                postData = {
                    account: match.account,
                    password: match.password,
                    deviceID: match.deviceId,
                    deviceKey: match.deviceKey
                };
            } else if (data4399.includes(match)) {
                postUrl = 'http://127.0.0.1:'+successfulPort+'/netease/auth/4399';
                postData = {
                    account: match.account,
                    password: match.password
                };
            } else if (sauthData.includes(match)) {
                postUrl = 'http://127.0.0.1:'+successfulPort+'/netease/auth/sauth';
                postData = {
                    sauth: atob(match.sauth) // Base64 解密
                };
            }

            // 如果有匹配的 URL 和数据，发送 POST 请求
            if (postUrl && postData) {
                try {
                    const response = await fetch(postUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(postData)
                    });

                    const result = await response.json();

                    if (result.code === 0) {
                        loginResults.push({ remark: remark, status: '成功' });
                    } else {
                        loginResults.push({ remark: remark, status: '失败' });
                    }
                } catch (error) {
                    console.error('POST request failed:', error);
                    loginResults.push({ remark: remark, status: '失败' });
                }
            }
        }
    }

    const successRemarks = loginResults.filter(item => item.status === '成功').map(item => item.remark);
    const failedRemarks = loginResults.filter(item => item.status === '失败').map(item => item.remark);
    const dialogDescription = document.getElementById('Login_return');
    if (failedRemarks.length === 0) {
        dialogDescription.textContent = `以下账号成功登录：${successRemarks.join(', ')}`;
    } else {
        dialogDescription.textContent = `登录成功的账号：${successRemarks.join(', ')}\n登录失败的账号：${failedRemarks.join(', ')}`;
    }
    if (successRemarks.length > 0) {
        fetchAccounts();
        loadNetworkList();
    }
    wait_dialog.open=false;
    const dialog = document.querySelector('.Dialog_Account_Login_Success');
    dialog.open = true;
}
async function fetchAccounts() {
    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/manager/netease/account');
        const data = await response.json();

        if (data.code === 0) {
            const accountList = document.getElementById('Account_Have_Signed_List').querySelector('mdui-collapse');
            accountList.innerHTML = ''; // 清空现有内容

            data.data.forEach(account => {
                const entityId = account.entityId;

                const collapseItem = document.createElement('mdui-collapse-item');
                collapseItem.innerHTML = `
                    <mdui-list-item slot="header" icon="account_circle">账户 ${entityId}</mdui-list-item>
                    <div style="margin-left: 2.5rem">
                        <mdui-list-item onclick="switchAccount('${entityId}')">切换到该账号</mdui-list-item>
                        <mdui-list-item onclick="logoutAccount('${entityId}')">退出登录</mdui-list-item>
                    </div>
                `;
                
                // 将collapse item添加到collapse中
                accountList.appendChild(collapseItem);
            });
        }
    } catch (error) {
        console.error('Error fetching accounts:', error);
    }
}

function switchAccount(entityId) {
    fetch('http://127.0.0.1:'+successfulPort+'/manager/netease/account/select/'+entityId)
        .then(response => response.json())
        .then(data => {
            console.log('Switched account:', data);
            const dialog = document.querySelector(".switch_successful");
            dialog.open = true;
        })
        .catch(error => console.error('Error switching account:', error));
}

function logoutAccount(entityId) {
    fetch('http://127.0.0.1:'+successfulPort+'/manager/netease/account/remove/'+entityId)
        .then(response => response.json())
        .then(data => {
            console.log('Logged out account:', data);
            fetchAccounts();
        })
        .catch(error => console.error('Error logging out account:', error));
}
cache_server_entityID="";
function open_add_dialog() {
    const dialog = document.querySelector(".Dialog_Add_Name");
    dialog.open = true;
}
function open_add_dialog_Rental() {
    const dialog = document.querySelector(".Dialog_Add_Name_Rental");
    dialog.open = true;
}
// function opendialog(entityId) {
//     cache_server_entityID=entityId;
//     const dialog = document.querySelector(".Dialog_Select");
//     dialog.open = true;
// }
let selectedEntityId = '';
let selectedName = '';
let namesList = []; 
let namesList_Rental = [];
let selectedEntityId_Rental = '';
let selectedName_Rental = '';
// 定义函数，输入 entity_id 返回对应的 name
function getNameByEntityId(entityId) {
    const foundItem = namesList.find(item => item.entity_id === entityId);
    return foundItem ? foundItem.name : null; // 如果找到返回 name，否则返回 null
}
function getNameByEntityId_Rental(entityId) {
    console.log(namesList_Rental);
    const foundItem = namesList_Rental.find(item => String(item.entity_id) === String(entityId));
    return foundItem ? foundItem.name : null; // 如果找到返回 name，否则返回 null
}
async function opendialog(entityId) {
    cache_server_entityID = entityId;

    const requestData = {
        offset: 0,
        length: 3,
        Game_id: entityId
    };

    try {
        const response = await fetch('http://127.0.0.1:' + successfulPort + '/netease/character/netgame/list', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (data.code === 0) {
            namesList = data.data
                .filter(item => item.expire_time === 0)
                .map(item => ({ name: item.name, entity_id: item.entity_id }));

            const selectElement = document.querySelector(".Dialog_Select_Select");

            selectElement.innerHTML = '';

            namesList.forEach(({ name, entity_id }) => {
                const option = document.createElement('mdui-menu-item');
                option.setAttribute('value', entity_id);
                option.textContent = name;
                selectElement.appendChild(option);
            });

            // 添加事件监听器以设置全局变量
            selectElement.addEventListener('change', (event) => {
                selectedEntityId = event.target.value; // 获取选中的 entity_id
                selectedName = getNameByEntityId(selectedEntityId); // 获取选中的名称
                console.log('选中的角色 entity_id:', selectedEntityId);
                console.log('选中的角色名称:', selectedName); // 打印角色名称
            });

            // 打开对话框
            const dialog = document.querySelector(".Dialog_Select");
            dialog.open = true;
        } else {
            console.error("服务器返回错误: ", data.msg);
        }
    } catch (error) {
        console.error("请求失败: ", error);
    }
}

async function opendialog_Rental(entityId) {
    cache_server_entityID = entityId;

    const requestData = {
        offset: 0,
        length: 3,
        Game_id: entityId
    };

    try {
        const response = await fetch('http://127.0.0.1:' + successfulPort + '/netease/character/rentalgame/list', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        console.log(data);
        if (data.code === 0) {
            namesList_Rental = data.data
                .filter(item => item.delete_ts === 0)
                .map(item => ({ name: item.name, entity_id: item.entity_id }));
            console.log(namesList_Rental);
            const selectElement = document.querySelector(".Dialog_Select_Select_Rental");

            selectElement.innerHTML = '';

            namesList_Rental.forEach(({ name, entity_id }) => {
                const option = document.createElement('mdui-menu-item');
                option.setAttribute('value', entity_id);
                option.textContent = name;
                selectElement.appendChild(option);
            });

            // 添加事件监听器以设置全局变量
            selectElement.addEventListener('change', (event) => {
                selectedEntityId_Rental = event.target.value; // 获取选中的 entity_id
                selectedName_Rental = getNameByEntityId_Rental(selectedEntityId_Rental); // 获取选中的名称
                console.log('选中的角色 entity_id:', selectedEntityId_Rental);
                console.log('选中的角色名称:', selectedName_Rental); // 打印角色名称
            });

            // 打开对话框
            const dialog = document.querySelector(".Dialog_Select_Rental");
            dialog.open = true;
        } else {
            console.error("服务器返回错误: ", data.msg);
        }
    } catch (error) {
        console.error("请求失败: ", error);
    }
}
async function random_add() {
    let characterName=generateRandomChineseName();
    if (!characterName) {
        console.error("请输入角色名");
        return;
    }

    const requestData = {
        name: characterName,
        game_id: cache_server_entityID
    };

    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/netease/character/netgame/add', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (data.code === 0) {


            const requestData = {
                offset: 0,
                length: 3,
                Game_id: cache_server_entityID
            };
        
            try {
                const response = await fetch('http://127.0.0.1:'+successfulPort+'/netease/character/netgame/list', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
        
                const data = await response.json();
        
                if (data.code === 0) {
                    namesList = data.data
                        .filter(item => item.expire_time === 0)
                        .map(item => ({ name: item.name, entity_id: item.entity_id }));
        
                    const selectElement = document.querySelector(".Dialog_Select_Select");
        
                    selectElement.innerHTML = '';
        
                    namesList.forEach(({ name, entity_id }) => {
                        const option = document.createElement('mdui-menu-item');
                        option.setAttribute('value', entity_id);
                        option.textContent = name;
                        selectElement.appendChild(option);
                    });
        
                    // 打开对话框
                    const dialog = document.querySelector(".Dialog_Select");
                    dialog.open = true;
                } else {
                    console.error("服务器返回错误: ", data.msg);
                }
            } catch (error) {
                console.error("请求失败: ", error);
            }
        } else {
            console.error("操作失败: " + data.msg);
        }
    } catch (error) {
        console.error("请求失败: ", error);
    }
}
async function random_add_Rental() {
    let characterName=generateRandomChineseName();
    if (!characterName) {
        console.error("请输入角色名");
        return;
    }

    const requestData = {
        name: characterName,
        game_id: cache_server_entityID
    };

    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/netease/character/rentalgame/add', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (data.code === 0) {


            const requestData = {
                offset: 0,
                length: 3,
                Game_id: cache_server_entityID
            };
        
            try {
                const response = await fetch('http://127.0.0.1:'+successfulPort+'/netease/character/rentalgame/list', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
        
                const data = await response.json();
        
                if (data.code === 0) {
                    namesList_Rental = data.data
                        .filter(item => item.delete_ts === 0)
                        .map(item => ({ name: item.name, entity_id: item.entity_id }));
                    console.log(namesList_Rental);
                    const selectElement = document.querySelector(".Dialog_Select_Select_Rental");

                    selectElement.innerHTML = '';

                    namesList_Rental.forEach(({ name, entity_id }) => {
                        const option = document.createElement('mdui-menu-item');
                        option.setAttribute('value', entity_id);
                        option.textContent = name;
                        selectElement.appendChild(option);
                    });

                    // 添加事件监听器以设置全局变量
                    selectElement.addEventListener('change', (event) => {
                        selectedEntityId_Rental = event.target.value; // 获取选中的 entity_id
                        selectedName_Rental = getNameByEntityId_Rental(selectedEntityId_Rental); // 获取选中的名称
                        console.log('选中的角色 entity_id:', selectedEntityId_Rental);
                        console.log('选中的角色名称:', selectedName_Rental); // 打印角色名称
                    });
        
                    // 打开对话框
                    const dialog = document.querySelector(".Dialog_Select_Rental");
                    dialog.open = true;
                } else {
                    console.error("服务器返回错误: ", data.msg);
                }
            } catch (error) {
                console.error("请求失败: ", error);
            }
        } else {
            console.error("操作失败: " + data.msg);
        }
    } catch (error) {
        console.error("请求失败: ", error);
    }
}
async function add_net_name(characterName) {

    if (!characterName) {
        console.error("请输入角色名");
        return;
    }

    const requestData = {
        name: characterName,
        game_id: cache_server_entityID
    };

    try {
        const response = await fetch("http://127.0.0.1:"+successfulPort+"/netease/character/netgame/add", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (data.code === 0) {
            const dialog = document.querySelector(".Dialog_Add_Name");
            dialog.open = false;

            const requestData = {
                offset: 0,
                length: 3,
                Game_id: cache_server_entityID
            };
        
            try {
                const response = await fetch('http://127.0.0.1:'+successfulPort+'/netease/character/netgame/list', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
        
                const data = await response.json();
        
                if (data.code === 0) {
                    const namesList = data.data
                        .filter(item => item.expire_time === 0)
                        .map(item => ({ name: item.name, entity_id: item.entity_id }));
        
                    const selectElement = document.querySelector(".Dialog_Select_Select");
        
                    selectElement.innerHTML = '';
        
                    namesList.forEach(({ name, entity_id }) => {
                        const option = document.createElement('mdui-menu-item');
                        option.setAttribute('value', entity_id);
                        option.textContent = name;
                        selectElement.appendChild(option);
                    });
        
                    // 打开对话框
                    const dialog = document.querySelector(".Dialog_Select");
                    dialog.open = true;
                } else {
                    console.error("服务器返回错误: ", data.msg);
                }
            } catch (error) {
                console.error("请求失败: ", error);
            }
        } else {
            console.error("操作失败: " + data.msg);
        }
    } catch (error) {
        console.error("请求失败: ", error);
    }
}
async function add_net_name_Rental(characterName) {

    if (!characterName) {
        console.error("请输入角色名");
        return;
    }

    const requestData = {
        name: characterName,
        game_id: cache_server_entityID
    };

    try {
        const response = await fetch("http://127.0.0.1:"+successfulPort+"/netease/character/rentalgame/add", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (data.code === 0) {
            const dialog = document.querySelector(".Dialog_Add_Name_Rental");
            dialog.open = false;

            const requestData = {
                offset: 0,
                length: 3,
                Game_id: cache_server_entityID
            };
        
            try {
                const response = await fetch('http://127.0.0.1:'+successfulPort+'/netease/character/rentalgame/list', {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
        
                const data = await response.json();
        
                if (data.code === 0) {
                    const namesList_Rental = data.data
                        .filter(item => item.delete_ts === 0)
                        .map(item => ({ name: item.name, entity_id: item.entity_id }));
        
                    const selectElement = document.querySelector(".Dialog_Select_Select_Rental");
        
                    selectElement.innerHTML = '';
        
                    namesList_Rental.forEach(({ name, entity_id }) => {
                        const option = document.createElement('mdui-menu-item');
                        option.setAttribute('value', entity_id);
                        option.textContent = name;
                        selectElement.appendChild(option);
                    });
        
                    // 打开对话框
                    const dialog = document.querySelector(".Dialog_Select_Rental");
                    dialog.open = true;
                } else {
                    console.error("服务器返回错误: ", data.msg);
                }
            } catch (error) {
                console.error("请求失败: ", error);
            }
        } else {
            console.error("操作失败: " + data.msg);
        }
    } catch (error) {
        console.error("请求失败: ", error);
    }
}
function generateRandomChineseName(length = 6) {
    let name = 'Pr_';
    for (let i = 0; i < length; i++) {
        const unicodeNum = Math.floor(Math.random() * (0x9FA5 - 0x4E00 + 1)) + 0x4E00;
        name += String.fromCharCode(unicodeNum);
    }
    return name;
}
async function fetchData(offset, length) {
    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/netease/item/netgame/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ offset: offset, length: length })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.code === 0) {
                return result.data;
            } else {
                console.error('Error:', result.msg);
            }
        } else {
            console.error('Network response was not ok.');
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}async function fetchRentalData(offset, length) {
    try {
        const response = await fetch('http://127.0.0.1:'+successfulPort+'/netease/item/rentalgame/list', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ offset: offset, length: length })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.code === 0) {
                return result.data;
            } else {
                console.error('Error:', result.msg);
            }
        } else {
            console.error('Network response was not ok.');
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
}
function updateRentalList(data) {
    const RentalList = document.getElementById('Rental_List_List');

    const collapseWrapper = document.createElement('mdui-collapse');
    collapseWrapper.setAttribute('accordion', '');

    data.forEach((item) => {
        const collapseItem = document.createElement('mdui-collapse-item');
        const listItemHeader = document.createElement('mdui-list-item');
        listItemHeader.setAttribute('slot', 'header');
        listItemHeader.setAttribute('icon', 'near_me');
        listItemHeader.textContent = item.name;
        collapseItem.appendChild(listItemHeader);

        const contentDiv = document.createElement('div');
        contentDiv.style.marginLeft = '2.5rem';

        const listItem = document.createElement('mdui-list-item');
        listItem.setAttribute('onclick', `opendialog_Rental('${item.entity_id}')`);

        const card = document.createElement('mdui-card');
        card.classList.add('Rental_Card');

        
        const imgsrc = document.createElement('img');
        imgsrc.classList.add('Rental_Card_Img');
        imgsrc.src = `${item.image_url}`;
        card.appendChild(imgsrc);

        const title = document.createElement('h1');
        title.classList.add('Title_Sub_No_Header');
        title.textContent = item.name;
        card.appendChild(title);

        const entityID = document.createElement('h1');
        entityID.classList.add('Title_Sub_Small');
        entityID.textContent = `EntityID: ${item.entity_id}`;
        card.appendChild(entityID);

        const summary = document.createElement('h1');
        summary.classList.add('Title_Sub_Small');
        summary.innerHTML = item.brief_summary;
        card.appendChild(summary);

        const onlineCount = document.createElement('h1');
        onlineCount.classList.add('Title_Sub_Small');
        onlineCount.textContent = `在线人数: ${item.player_count}`;
        card.appendChild(onlineCount);

        const version = document.createElement('h1');
        version.classList.add('Title_Sub_Small');
        version.textContent = `游戏版本: ${item.mc_version}`;
        card.appendChild(version);

        listItem.appendChild(card);
        contentDiv.appendChild(listItem);
        collapseItem.appendChild(contentDiv);
        collapseWrapper.appendChild(collapseItem);
    });

    RentalList.appendChild(collapseWrapper);
}

async function loadRentalList() {
    const length = 50;
    let offset = 0;

    for (let i = 0; i < 4; i++) {
        const data = await fetchRentalData(offset, length);
        if (data) {
            updateRentalList(data);
        }
        offset += 50;
    }
}
function filterList() {
    const searchBox = document.getElementById('searchBox');
    const filterText = searchBox.value.toLowerCase();
    const networkList = document.getElementById('Network_List_List');
    const collapseItems = networkList.querySelectorAll('mdui-collapse-item');

    collapseItems.forEach((collapseItem) => {
        const header = collapseItem.querySelector('mdui-list-item[slot="header"]');
        const headerText = header.textContent.toLowerCase();

        if (headerText.includes(filterText)) {
            collapseItem.style.display = ''; // 显示符合条件的项
        } else {
            collapseItem.style.display = 'none'; // 隐藏不符合条件的项
        }
    });
}
function filterList_rental() {
    const searchBox = document.getElementById('searchBox_rental');
    const filterText = searchBox.value.toLowerCase();
    const networkList = document.getElementById('Rental_List_List');
    const collapseItems = networkList.querySelectorAll('mdui-collapse-item');

    collapseItems.forEach((collapseItem) => {
        const header = collapseItem.querySelector('mdui-list-item[slot="header"]');
        const headerText = header.textContent.toLowerCase();

        if (headerText.includes(filterText)) {
            collapseItem.style.display = ''; // 显示符合条件的项
        } else {
            collapseItem.style.display = 'none'; // 隐藏不符合条件的项
        }
    });
}
function updateNetworkList(data) {
    const networkList = document.getElementById('Network_List_List');

    const collapseWrapper = document.createElement('mdui-collapse');
    collapseWrapper.setAttribute('accordion', '');

    data.forEach((item) => {
        const collapseItem = document.createElement('mdui-collapse-item');
        const listItemHeader = document.createElement('mdui-list-item');
        listItemHeader.setAttribute('slot', 'header');
        listItemHeader.setAttribute('icon', 'near_me');
        listItemHeader.textContent = item.name;
        collapseItem.appendChild(listItemHeader);

        const contentDiv = document.createElement('div');
        contentDiv.style.marginLeft = '2.5rem';

        const listItem = document.createElement('mdui-list-item');
        listItem.setAttribute('onclick', `opendialog('${item.entity_id}')`);

        const card = document.createElement('mdui-card');
        card.classList.add('Netword_Card');

        const title = document.createElement('h1');
        title.classList.add('Title_Sub_No_Header');
        title.textContent = item.name;
        card.appendChild(title);

        const entityID = document.createElement('h1');
        entityID.classList.add('Title_Sub_Small');
        entityID.textContent = `EntityID: ${item.entity_id}`;
        card.appendChild(entityID);

        const summary = document.createElement('h1');
        summary.classList.add('Title_Sub_Small');
        summary.innerHTML = item.brief_summary;
        card.appendChild(summary);

        const onlineCount = document.createElement('h1');
        onlineCount.classList.add('Title_Sub_Small');
        onlineCount.textContent = `在线人数: ${item.online_count}`;
        card.appendChild(onlineCount);

        listItem.appendChild(card);
        contentDiv.appendChild(listItem);
        collapseItem.appendChild(contentDiv);
        collapseWrapper.appendChild(collapseItem);
    });

    networkList.appendChild(collapseWrapper);
}

async function loadNetworkList() {
    const length = 50;
    let offset = 0;

    for (let i = 0; i < 4; i++) {
        const data = await fetchData(offset, length);
        if (data) {
            updateNetworkList(data);
        }
        offset += 50;
    }
}
async function sendPostRequest(serverEntity) {
    const wait_dialog = document.querySelector('.Wait_Zha_Pian_User');
    wait_dialog.open = true;
    const url = 'http://127.0.0.1:'+successfulPort+'/netease/game/join/pre';
    const data = {
        gameId: serverEntity, 
        roleName: selectedName
    };
    try {
        const response = await fetch(url, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('成功:', result);
        fetchMcVersionName(serverEntity);
        
        
    } catch (error) {
        const dialog = document.getElementById('register_success');
        dialog.headline=`代理开启失败`
        dialog.description=`${error}`;
        dialog.open=true;
    }
}
let mcversioncache="";
async function fetchMcVersionName(entityID) {
    const versionUrl = 'http://127.0.0.1:'+successfulPort+'/netease/game/version';
    const mcVersionApiUrl = 'https://x19apigatewayobt.nie.netease.com/mc-version';

    const versionData = { item_id: entityID };

    try {
        const response = await fetch(versionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(versionData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const mcVersionId = result.data[0].mc_version_id;

        const mcVersionResponse = await fetch(mcVersionApiUrl);
        if (!mcVersionResponse.ok) {
            throw new Error(`HTTP error! status: ${mcVersionResponse.status}`);
        }

        const mcVersionData = await mcVersionResponse.json();
        const entities = mcVersionData.entities;

        // 查找与 mc_version_id 匹配的版本名称
        const versionEntity = mcVersionData.entities.find(entity => entity.entity_id === mcVersionId);
        if (versionEntity) {
            console.log(versionEntity.name);
            mcversioncache=versionEntity.name;
            fetchGameAddress(entityID);
            return versionEntity.name; // 返回版本名称
        } else {
            const dialog = document.getElementById('register_success');
            dialog.headline=`代理开启失败`
            dialog.description=`未找到匹配的版本名称，mc_version_id: ${mcVersionId}`;
            dialog.open=true;
        }

    } catch (error) {
        const dialog = document.getElementById('register_success');
            dialog.headline=`代理开启失败`
            dialog.description=`${error}`;
            dialog.open=true;
        return null;
    }
}
let ip = '';
let port = '';
async function fetchGameAddress(serverEntity) {
    const addressUrl = 'http://127.0.0.1:'+successfulPort+'/netease/game/address';
    const requestData = { item_id: serverEntity };

    try {
        const response = await fetch(addressUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const addressData = await response.json(); // 获取响应数据
        // 设置全局变量
        ip = addressData.data.ip; 
        port = addressData.data.port;
        console.log('IP:', ip); // 输出 IP
        console.log('Port:', port); // 输出 Port
        startProxy(serverEntity,mcversioncache , false);
    } catch (error) {
        const dialog = document.getElementById('register_success');
            dialog.headline=`代理开启失败`
            dialog.description=`${error}`;
            dialog.open=true;
    }
}
async function startProxy(serverEntity, versionName, checkbox) {
    const proxyStartUrl = 'http://127.0.0.1:'+successfulPort+'/netease/game/proxy/start';
    const requestData = {
        serverItemId: serverEntity,
        roleId: selectedEntityId,
        roleName: selectedName,
        gameVersion: versionName,
        serverIp: ip, // 使用全局变量 ip
        serverPort: port, // 使用全局变量 port
        useProxy:false// 根据复选框状态设置
    };

    try {
        const response = await fetch(proxyStartUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const dialog = document.getElementById('register_success');
            dialog.headline=`代理开启失败`
            dialog.description=`HTTP error! status: ${response.status}`;
            dialog.open=true;
        }

        const result = await response.json(); // 获取响应数据
        const dialog = document.getElementById('register_success');
            dialog.headline=`${selectedName}  代理开启成功`
            dialog.description=`代理服务器：${ip}:${port}`;
            dialog.open=true;
        console.log('代理启动成功:', result); // 输出成功信息

    } catch (error) {
        const dialog = document.getElementById('register_success');
            dialog.headline=`代理开启失败`
            dialog.description=`${error}`;
            dialog.open=true;
        console.error('请求失败:', error);
    }
    const wait_dialog = document.querySelector('.Wait_Zha_Pian_User');
    wait_dialog.open = false;
}
function validateAccount(account) {
    const regex = /^[a-zA-Z0-9]{3,20}$/; // 只允许字母和数字
    return regex.test(account);
}
function validatePassword(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;  // 至少8个字符，包含字母和数字
    return regex.test(password);
}
function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;  // 基本的邮件格式
    return regex.test(email);
}
function validatePhone(phone) {
    const regex = /^[1][3-9][0-9]{9}$/;  // 中国大陆手机号的正则表达式
    return regex.test(phone);
}
function validateKami(kami) {
    return kami.startsWith('EnvisionRegister_');
}


function Register(username, password,email, phone,kami,dcname) {
    const wait_dialog = document.querySelector('.Wait_Zha_Pian_User');
    wait_dialog.open = true;
    const url = 'http://127.0.0.1:'+successfulPort+'/auth/register';
    const data = {
        username: username,
        password: password,
        email: email,
        phone: phone,
        RegCode: kami,
        discord: dcname
    };
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.code===0) {
           const dialog = document.getElementById('register_success');
           dialog.headline="注册成功"
            dialog.description=result.msg;
           dialog.open=true;
           const dddialog=document.querySelector('.Prisma_Register');
            dddialog.open=false;
        } else {
            const dialog = document.getElementById('register_success');
            dialog.headline="注册失败"
            dialog.description=result.msg;
            dialog.open=true;
        }
        console.log(result);
    })
    .catch(error => {
        const dialog = document.getElementById('register_success');
        dialog.headline="注册失败"
        dialog.description=error;
        dialog.open=true;
    })
    wait_dialog.open=false;
}

async function sendPostRequest_Rental(serverEntity) {
    const url = 'http://127.0.0.1:'+successfulPort+'/netease/game/join/pre';
    const data = {
        gameId: serverEntity, 
        roleName: selectedName_Rental
    };
    try {
        const response = await fetch(url, {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('成功:', result);
        fetchMcVersionName_Rental(serverEntity);
        
        
    } catch (error) {
        console.error('请求失败:', error);
    }
}
let mcversioncache_Rental="";
async function fetchMcVersionName_Rental(entityID) {
    const versionUrl = 'http://127.0.0.1:'+successfulPort+'/netease/game/version';
    const mcVersionApiUrl = 'https://x19apigatewayobt.nie.netease.com/mc-version';

    const versionData = { item_id: entityID };

    try {
        const response = await fetch(versionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(versionData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const mcVersionId = result.data[0].mc_version_id;

        const mcVersionResponse = await fetch(mcVersionApiUrl);
        if (!mcVersionResponse.ok) {
            throw new Error(`HTTP error! status: ${mcVersionResponse.status}`);
        }

        const mcVersionData = await mcVersionResponse.json();
        const entities = mcVersionData.entities;

        // 查找与 mc_version_id 匹配的版本名称
        const versionEntity = mcVersionData.entities.find(entity => entity.entity_id === mcVersionId);
        if (versionEntity) {
            console.log(versionEntity.name);
            mcversioncache=versionEntity.name;
            fetchGameAddress_Rental(entityID);
            return versionEntity.name; // 返回版本名称
        } else {
            const dialog = document.getElementById('register_success');
            dialog.headline=`代理开启失败`
            dialog.description=`未找到匹配的版本名称，mc_version_id: ${mcVersionId}`;
            dialog.open=true;
        }

    } catch (error) {
        const dialog = document.getElementById('register_success');
        dialog.headline=`代理开启失败`
        dialog.description=`${error}`;
        dialog.open=true;
        return null;
    }
}
let ip_Rental = '';
let port_Rental = '';
async function fetchGameAddress_Rental(serverEntity) {
    const addressUrl = 'http://127.0.0.1:'+successfulPort+'/netease/game/address';
    const requestData = { item_id: serverEntity };

    try {
        const response = await fetch(addressUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const addressData = await response.json(); // 获取响应数据
        // 设置全局变量
        ip_Rental = addressData.data.ip; 
        port_Rental = addressData.data.port;
        console.log('IP:', ip); // 输出 IP
        console.log('Port:', port); // 输出 Port
        startProxy_Rental(serverEntity,mcversioncache , false);
    } catch (error) {
        const dialog = document.getElementById('register_success');
        dialog.headline=`代理开启失败`
        dialog.description=`${error}`;
        dialog.open=true;
    }
}
async function startProxy_Rental(serverEntity, versionName, checkbox) {
    const proxyStartUrl = 'http://127.0.0.1:'+successfulPort+'/netease/game/proxy/start';
    const requestData = {
        serverItemId: serverEntity,
        roleId: selectedEntityId_Rental,
        roleName: selectedName_Rental,
        gameVersion: versionName,
        serverIp: ip_Rental, // 使用全局变量 ip
        serverPort: port_Rental, // 使用全局变量 port
        useProxy:false// 根据复选框状态设置
    };

    try {
        const response = await fetch(proxyStartUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json(); // 获取响应数据
        const dialog = document.getElementById('register_success');
        dialog.headline=`${selectedName_Rental}  代理开启成功`
        dialog.description=`代理服务器：${ip_Rental}:${port_Rental}`;
            dialog.open=true;
        console.log('代理启动成功:', result); // 输出成功信息

    } catch (error) {
        const dialog = document.getElementById('register_success');
        dialog.headline=`代理开启失败`
        dialog.description=`${error}`;
        dialog.open=true;
    }
}
async function fetchAndDisplayProxies() {
    const url = "http://127.0.0.1:"+successfulPort+"/manager/proxy/list";

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.code !== 0) {
            throw new Error(`API returned error: ${result.msg}`);
        }
        const data = result.data;
        const dailiMain = document.querySelector('#daili .daili_main');
        dailiMain.innerHTML = '';
        data.forEach(item => {
            const card = document.createElement('mdui-card');
            card.setAttribute('variant', 'outlined');
            card.style.width = '80%';
            card.style.margin = '0 auto';
            card.style.height = 'auto';
            card.style.padding = '20px';
            card.style.marginTop= '20px';
            const deleteIcon = document.createElement('mdui-icon');
            deleteIcon.setAttribute('name', 'delete');
            deleteIcon.style.position = 'absolute';
            deleteIcon.style.top = '10px';
            deleteIcon.style.right = '10px';
            deleteIcon.style.cursor = 'pointer';
            deleteIcon.addEventListener('click', () => stopproxy(item.roleID, card));
            const topSection = document.createElement('div');
            topSection.style.display = 'flex';
            topSection.style.alignItems = 'center';
            topSection.style.marginBottom = '10px';
            const roleInfo = document.createElement('div');
            roleInfo.innerHTML = `
                <p style="margin: 0; font-size: 18px; font-weight: bold;">角色名: ${item.roleName}</p>
                <p style="margin: 0; font-size: 14px; color: gray;">${item.server}</p>
            `;
            topSection.appendChild(roleInfo);
            const divider = document.createElement('mdui-divider');
            divider.setAttribute('middle', '');
            const contentSection = document.createElement('div');
            contentSection.innerHTML = `
                <p style="margin: 5px 0; font-size: 18px;">本地IP: 127.0.0.1:${item.port}</p>
                <p style="margin: 5px 0; font-size: 14px;">角色ID: ${item.roleID}</p>
                <p style="margin: 5px 0; font-size: 14px;">游戏UUID: ${item.roleGameUUID}</p>
                <p style="margin: 5px 0; font-size: 14px;">Token: ${item.neteaseToken}</p>
            `;
            card.appendChild(deleteIcon);
            card.appendChild(topSection);
            card.appendChild(divider);
            card.appendChild(contentSection);
            dailiMain.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching or processing proxy data:", error);
    }
}
function stopproxy(roleID, cardElement) {
    console.log(`Stopping proxy for roleID: ${roleID}`);
    fetch(`http://127.0.0.1:${successfulPort}/netease/game/proxy/stop`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roleID }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to stop proxy for roleID: ${roleID}`);
            }
            return response.json();
        })
        .then(result => {
            if (result.code !== 0) {
                throw new Error(`Error from server: ${result.msg}`);
            }
            cardElement.classList.add('fade-out');
            cardElement.addEventListener('animationend', () => {
                cardElement.remove();
            });
            console.log(`Proxy stopped successfully for roleID: ${roleID}`);
            fetchAndDisplayProxies();
        })
        .catch(error => {
            console.error("Error stopping proxy:", error);
        });
}