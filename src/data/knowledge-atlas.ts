export interface AtlasArea {
  k: string;
  L: string;
  t: string;
  en: string;
  one: string;
  topics: string[];
  confs: [string, string, string][];
  hot: string[];
  near: string[];
}

export const atlasLayers = [
 {id:"apps",layer:"应用驱动",sub:"负载反推系统"},
 {id:"scale",layer:"规模化",sub:"从一台到一万台"},
 {id:"sw",layer:"系统软件",sub:"管理与翻译硬件"},
 {id:"hw",layer:"硬件",sub:"晶体管之上"},
];
export const atlasAreas: AtlasArea[] = [
 {k:"mlsys",L:"apps",t:"MLSys",en:"Machine Learning Systems",
  one:"为大模型训练和推理设计系统。专门会议 MLSys 还未进 CCF 目录，论文主要发在各大系统 A 类会议上。",
  topics:["分布式训练并行策略：数据 / 张量 / 流水线 / 专家并行","LLM 推理服务：KV Cache 管理、批处理调度、投机解码","深度学习编译：算子融合、自动调优（TVM、Triton 一类）","训练容错、显存优化、低精度与量化"],
  confs:[["OSDI","A","系统顶会，ML 系统论文占比很高"],["SOSP","A","同上，奇数年举办"],["ASPLOS","A","软硬协同"],["EuroSys","A","欧洲系统旗舰"],["USENIX ATC","A","系统综合"],["ISCA","A","AI 加速器"],["MICRO","A","AI 加速器"],["NSDI","A","训练网络与集群"],["SC","A","大规模训练"],["PPoPP","A","并行算子与通信"],["NeurIPS","A","人工智能类，含系统方向论文"],["ICML","A","人工智能类"],["MLSys","—","本方向旗舰，未列入 CCF"]],
  hot:["LLM Serving","长上下文","MoE 系统","训推一体"],near:["arch","dist","comp","net","hpc"]},
 {k:"db",L:"apps",t:"数据库系统",en:"Database Systems",
  one:"让数据被高效、正确地存储、查询和更新。",
  topics:["查询优化与执行引擎（向量化、编译执行）","事务与并发控制、分布式数据库","存储引擎：LSM-tree、B-tree、列存","向量数据库、AI for DB"],
  confs:[["SIGMOD","A","旗舰"],["VLDB","A","旗舰"],["ICDE","A","大型综合会议"],["PODS","B","数据库理论"],["EDBT","B","欧洲数据库"],["CIDR","B","前瞻想法"],["DASFAA","B","亚太数据库"],["ICDT","B","数据库理论"]],
  hot:["向量检索","湖仓一体","Learned Index","HTAP"],near:["stor","dist","comp"]},
 {k:"edge",L:"apps",t:"嵌入式 · 边缘 · 量子",en:"Embedded / Edge / Quantum",
  one:"资源受限或物理形态特殊的计算平台，合在一起算一个方向。",
  topics:["实时系统调度与可预测性","IoT 与移动端系统、端侧推理","边缘—云协同计算","量子计算的编译、纠错架构与控制系统"],
  confs:[["RTSS","A","实时系统旗舰（交叉类）"],["MobiCom","A","移动计算（网络类）"],["RTAS","B","实时与嵌入式"],["EMSOFT","B","嵌入式软件"],["CODES+ISSS","B","软硬件协同设计"],["LCTES","B","嵌入式语言与编译"],["MobiSys","B","移动系统"],["SenSys","B","传感系统"],["IPSN","B","传感网络"],["CASES","C","嵌入式编译与架构"],["IEEE QCE","—","量子计算工程，未列入"]],
  hot:["端侧大模型","TinyML","量子纠错","机器人系统"],near:["arch","energy","comp"]},

 {k:"dist",L:"scale",t:"分布式系统",en:"Distributed Systems",
  one:"让许多机器像一台可靠的机器那样协作。",
  topics:["共识协议与复制（Paxos、Raft 及其变体）","一致性模型、分布式事务","集群调度与资源管理","大规模数据处理框架"],
  confs:[["OSDI","A","系统综合顶会"],["SOSP","A","系统综合顶会"],["NSDI","A","网络化系统"],["EuroSys","A","欧洲系统旗舰"],["PODC","B","分布式计算理论"],["ICDCS","B","分布式计算系统"],["Middleware","B","中间件"],["SPAA","B","并行算法与架构"],["Euro-Par","B","欧洲并行与分布式"],["CCGRID","C","集群 / 云 / 网格"]],
  hot:["地理分布式","确定性执行","形式化验证","Serverless 状态"],near:["cloud","stor","net","rel","mlsys"]},
 {k:"hpc",L:"scale",t:"HPC",en:"High Performance Computing",
  one:"在超算上把科学计算和大规模并行程序跑到极限性能。",
  topics:["并行编程模型：MPI、OpenMP、PGAS","科学计算库与稀疏 / 稠密线性代数","性能建模、可扩展性分析","超算互连、I/O 与作业调度"],
  confs:[["SC","A","旗舰"],["PPoPP","A","并行编程原理"],["ICS","B","超级计算"],["IPDPS","B","并行与分布式处理"],["HPDC","B","高性能分布式计算"],["CLUSTER","B","集群计算"],["ICPP","B","并行处理"],["SPAA","B","并行算法与架构"],["Euro-Par","B","欧洲并行"],["HiPC","C","高性能计算"],["HPCC","C","高性能计算与通信"]],
  hot:["AI for Science","混合精度","E 级计算","HPC + 云"],near:["arch","net","comp","mlsys"]},
 {k:"stor",L:"scale",t:"存储系统",en:"Storage Systems",
  one:"数据落盘之后的一切：设备、文件系统到分布式存储。",
  topics:["SSD / FTL、ZNS、持久内存","文件系统设计与崩溃一致性","键值存储与分布式存储","CXL 内存池化、存储分层"],
  confs:[["FAST","A","旗舰"],["USENIX ATC","A","系统综合"],["OSDI","A","存储论文常见"],["EuroSys","A","系统综合"],["MSST","B","海量存储"],["SYSTOR","C","系统与存储"]],
  hot:["CXL","计算型存储","AI 数据管线","可持续存储"],near:["os","db","dist","arch"]},
 {k:"net",L:"scale",t:"网络与通信",en:"Networking & Communication",
  one:"让数据在机器之间又快又稳地流动。",
  topics:["数据中心网络拓扑与拥塞控制","RDMA、可编程交换机（P4）、SmartNIC","集合通信库与 AI 训练网络","网络测量、验证与 SDN"],
  confs:[["SIGCOMM","A","旗舰"],["NSDI","A","网络化系统"],["INFOCOM","A","偏理论与通信"],["MobiCom","A","移动与无线"],["CoNEXT","B","网络新技术"],["ICNP","B","网络协议"],["IMC","B","网络测量"],["IWQoS","B","服务质量"],["HotNets","C","前瞻短文"],["HOTI","C","高性能互连"],["APNet","C","亚太网络"]],
  hot:["AI 集群网络","超以太网","光互连","在网计算"],near:["dist","hpc","mlsys","cloud"]},

 {k:"os",L:"sw",t:"操作系统",en:"Operating Systems",
  one:"管理硬件资源，并给上层提供干净抽象的那一层。",
  topics:["进程 / 线程调度、虚拟内存管理","内核可扩展性：eBPF、内核旁路","新型硬件的 OS 支持（CXL、异构加速器）","用 Rust 等安全语言重写内核"],
  confs:[["OSDI","A","旗舰"],["SOSP","A","旗舰"],["EuroSys","A","欧洲旗舰"],["USENIX ATC","A","系统综合"],["ASPLOS","A","软硬交界"],["HotOS","B","前瞻短文"],["VEE","B","虚拟执行环境"]],
  hot:["eBPF","Rust 内核","内存分层","微内核复兴"],near:["cloud","stor","sec","arch","comp"]},
 {k:"cloud",L:"sw",t:"云计算与虚拟化",en:"Cloud & Virtualization",
  one:"把物理机切分、隔离、按需交付给大量租户，并评估它的性能。",
  topics:["Hypervisor、轻量虚拟机与容器","Serverless 冷启动与资源效率","多租户隔离、资源超卖与调度","系统性能测量与建模"],
  confs:[["EuroSys","A","系统综合"],["NSDI","A","网络化系统"],["USENIX ATC","A","系统综合"],["SoCC","B","云计算专门会议"],["VEE","B","虚拟化"],["SIGMETRICS","B","性能测量与建模"],["Performance","B","性能建模与评估"],["LISA","B","大规模系统运维"],["IEEE CLOUD","C","云计算"],["CCGRID","C","集群 / 云 / 网格"]],
  hot:["Serverless","机密计算","GPU 池化","碳感知调度"],near:["os","dist","net","sec","energy"]},
 {k:"comp",L:"sw",t:"编译器与运行时",en:"Compilers & Runtimes",
  one:"把高级程序高效地翻译到越来越多样的硬件上。",
  topics:["中间表示设计（LLVM、MLIR）","自动并行化与向量化","JIT、垃圾回收、语言虚拟机","面向加速器的领域专用语言"],
  confs:[["PLDI","A","编程语言旗舰"],["OOPSLA","A","面向对象与系统"],["POPL","A","偏语言理论"],["ASPLOS","A","软硬交界"],["PPoPP","A","并行编程"],["CGO","B","代码生成与优化"],["PACT","B","并行架构与编译"],["HiPEAC","B","高性能嵌入式架构与编译"],["LCTES","B","嵌入式编译"],["SAS","B","静态分析"]],
  hot:["MLIR","AI 编译器","ML 驱动优化","安全编译"],near:["mlsys","arch","hpc","os"]},

 {k:"arch",L:"hw",t:"Arch",en:"Computer Architecture",
  one:"处理器、加速器和内存层次的设计；含异构计算、FPGA 可重构计算与内存子方向。",
  topics:["微架构：流水线、分支预测、缓存","领域专用加速器、GPU、NPU","内存层次、存内 / 近存计算、CXL","FPGA 与可重构计算、Chiplet"],
  confs:[["ISCA","A","旗舰"],["MICRO","A","旗舰"],["HPCA","A","高性能架构"],["ASPLOS","A","软硬交界"],["FPGA","B","可重构计算旗舰"],["HOT CHIPS","B","工业界芯片发布"],["ICCD","B","计算机设计"],["PACT","B","并行架构与编译"],["HiPEAC","B","高性能嵌入式架构"],["FCCM","C","可重构计算"],["FPL","C","可编程逻辑"],["ISPASS","C","性能分析"],["NOCS","C","片上网络"]],
  hot:["AI 加速器","Chiplet","存算一体","RISC-V"],near:["eda","comp","mlsys","energy","hpc"]},
 {k:"eda",L:"hw",t:"EDA",en:"Electronic Design Automation",
  one:"用软件工具把电路设计从描述变成可流片的版图。",
  topics:["逻辑综合、布局布线、时序分析","高层次综合（HLS）","形式化验证、仿真与芯片测试","AI for EDA、芯片设计自动化"],
  confs:[["DAC","A","旗舰"],["ICCAD","B","计算机辅助设计"],["DATE","B","欧洲旗舰"],["CODES+ISSS","B","软硬件协同设计"],["ICCD","B","计算机设计"],["ITC","B","芯片测试"],["ASP-DAC","C","亚太设计自动化"],["ISPD","C","物理设计"],["GLSVLSI","C","VLSI"]],
  hot:["LLM 写 RTL","Chiplet 设计","开源 EDA","3D IC"],near:["arch","energy","rel"]},

 {k:"sec",L:"rail",t:"系统安全",en:"Systems Security",
  one:"从硬件到应用，找漏洞、补漏洞、建立可信边界。",
  topics:["可信执行环境（SGX、TDX、机密计算）","侧信道攻击与防御","内存安全与漏洞挖掘（Fuzzing）","操作系统与固件安全"],
  confs:[["S&P","A","IEEE 安全与隐私"],["USENIX Security","A","安全四大"],["CCS","A","安全四大"],["NDSS","A","安全四大"],["CHES","B","硬件密码与侧信道"],["ACSAC","B","安全应用"],["RAID","B","入侵检测"],["ESORICS","B","欧洲安全"],["EuroS&P","C","欧洲安全与隐私"],["AsiaCCS","C","亚洲 CCS"]],
  hot:["机密 AI","LLM 安全","CHERI","供应链安全"],near:["os","cloud","arch"]},
 {k:"rel",L:"rail",t:"可靠性",en:"Dependability",
  one:"系统出错时仍然能正确运行，或至少安全地失败。",
  topics:["故障注入与容错设计","静默数据错误（SDC）","大规模系统可用性分析","软件缺陷检测与在线诊断"],
  confs:[["DSN","B","可靠性旗舰"],["SRDS","B","可靠分布式系统"],["ISSRE","B","软件可靠性"],["ITC","B","芯片测试"],["OSDI","A","故障研究常见"],["VTS","C","VLSI 测试"],["ETS","C","欧洲测试"]],
  hot:["GPU 集群容错","SDC 检测","Gray Failure","自愈系统"],near:["dist","stor","eda"]},
 {k:"energy",L:"rail",t:"能效优化",en:"Energy Efficiency",
  one:"每焦耳能多算多少，从芯片功耗到数据中心碳排放。CCF 目录里几乎没有专门的能效会议，论文分散在架构和系统会议上。",
  topics:["DVFS 与功耗管理","功耗 / 热建模","数据中心能耗与碳感知计算","低功耗电路与架构"],
  confs:[["HPCA","A","架构中的能效论文"],["MICRO","A","同上"],["DAC","A","低功耗设计"],["SIGMETRICS","B","能耗测量与建模"],["ISLPED","C","低功耗设计专门会议"],["e-Energy","—","能源与计算，未列入"],["HotCarbon","—","可持续计算，未列入"]],
  hot:["碳感知调度","AI 能耗","液冷","近似计算"],near:["arch","cloud","edge","eda"]},
];

