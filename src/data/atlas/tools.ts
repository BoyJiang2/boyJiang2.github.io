import type { Tool } from './types';

export const tools: Record<string, Tool> = {
  gem5: {
    name: 'gem5',
    use: 'CPU 微架构、缓存与一致性协议、内存系统',
    capabilities:
      '全系统模式（可以启动 Linux）和系统调用仿真模式；CPU 模型从简单的 Atomic、Timing 到顺序核 Minor、乱序核 O3；内存系统有 Classic 和 Ruby 两套，Ruby 可以自定义一致性协议',
    limitations:
      '详细模型很慢，通常只能跑程序的一小段，要配合采样或检查点；默认配置不对应任何一款商用处理器，绝对性能数字不能直接当作真机结果',
    validation:
      '用真机硬件计数器对比关键指标；按目标处理器校准参数；论文中优先报告相对趋势。Gutierrez 等人专门分析过全系统模拟相对真机的误差来源',
    sources: [
      { label: 'gem5 官方文档', url: 'https://www.gem5.org/documentation/' },
      {
        label: 'Gutierrez 等，Sources of Error in Full-System Simulation，ISPASS 2014（最佳论文）',
        url: 'https://eecs.engin.umich.edu/stories/researchers-win-best-paper-award-at-ispass-2014',
      },
    ],
    verification: 'part',
    verificationNote:
      '误差论文的出处已核实；CPU 模型与运行模式出自官方文档，本次官方页面未能在线复核',
  },
  accel: {
    name: 'Accel-Sim / GPGPU-Sim',
    use: 'GPU 微架构：warp 调度、缓存、访存合并',
    capabilities:
      '支持执行驱动（PTX 虚拟指令集）和 trace 驱动（NVIDIA 原生机器指令）两种模式；trace 模式可以运行 cuDNN 这类闭源库的 kernel',
    limitations:
      '新一代 GPU 的很多微架构细节没有公开，只能靠微基准测试推断后近似建模；主要面向 NVIDIA GPU；速度远慢于真机',
    validation:
      '框架自带微基准和逐个性能计数器的相关性分析；论文报告在 80 个负载上，周期误差比此前的模拟器降低了 79 个百分点',
    sources: [
      {
        label: 'Khairy 等，Accel-Sim，ISCA 2020',
        url: 'https://engineering.purdue.edu/tgrogers/publication/khairy-isca-2020',
      },
    ],
    verification: 'ok',
  },
  ramulator: {
    name: 'Ramulator 2.0',
    use: 'DRAM 控制器、调度策略、刷新、RowHammer 缓解机制',
    capabilities:
      '按 DRAM 标准规定的时序规则模拟内存子系统；模块化设计，方便加入新标准和新机制；可以单独读 trace 运行，也可以和 CPU 模拟器联合使用',
    limitations:
      '只模拟内存子系统，处理器端需要 trace 或其他模拟器提供；模拟的是命令和时序，不模拟单元之间的电气干扰这类电路级效应',
    validation: '与 DRAM 标准中的时序参数核对；与其他内存模拟器或真实测量交叉对比',
    sources: [
      { label: 'Luo 等，Ramulator 2.0，IEEE CAL', url: 'https://arxiv.org/abs/2308.11030' },
      { label: 'GitHub 仓库', url: 'https://github.com/CMU-SAFARI/ramulator2' },
    ],
    verification: 'part',
    verificationNote: '论文出处已核实；原文页面因访问限流未能读取，能力描述按公开资料概括',
  },
  sst: {
    name: 'SST',
    use: 'HPC 整机系统、互连拓扑、大规模内存层次的设计空间探索',
    capabilities:
      'Core 负责时钟、事件和并行调度，Elements 提供具体模型：Merlin 网络（mesh、torus、fat-tree、dragonfly）、memHierarchy 缓存与内存控制器、基于 PIN 的 Ariel 处理器模型；可以用 MPI 并行运行，官方展示过百万级组件的规模',
    limitations:
      '精度取决于选用的组件；部分核模型非常简化，比如 Miranda 只运行生成的指令流，不运行真实程序；分区不合理会拖慢模拟',
    validation: '先在小规模上与真机或细粒度模拟器对比，再放大规模；关键组件单独校准',
    sources: [
      {
        label: 'Sandia SST 教程，SC25',
        url: 'https://sc25.supercomputing.org/wp-content/uploads/2025/08/sst_scc_2025_sand.pdf',
      },
    ],
    verification: 'ok',
  },
  timeloop: {
    name: 'Timeloop + Accelergy',
    use: 'DNN 加速器的数据流、映射与存储层次设计；也可用来估算加速器能耗',
    capabilities:
      '用统一的格式描述加速器的存储层次和计算阵列，自动搜索映射空间，估算性能和能耗；其中 Accelergy 负责按组件估算能耗和面积',
    limitations:
      '属于解析模型，不是周期级模拟，对拥塞、停顿等动态行为的刻画有限；能耗结果依赖输入的组件能耗表',
    validation: '与已发表芯片的数据对比；关键设计点再用 RTL 或周期级模拟复核',
    sources: [
      {
        label: 'Parashar 等，Timeloop，ISPASS 2019',
        url: 'https://research.nvidia.com/publication/2019-03_timeloop-systematic-approach-dnn-accelerator-evaluation',
      },
      { label: 'Timeloop / Accelergy 教程', url: 'https://accelergy.mit.edu/tutorial.html' },
    ],
    verification: 'ok',
  },
  verilator: {
    name: 'Verilator',
    use: 'RTL 设计的功能验证和周期级仿真',
    capabilities:
      '把可综合的 Verilog / SystemVerilog 编译成 C++ 模型，运行速度明显快于事件驱动的仿真器',
    limitations:
      '主要面向可综合子集；对四态逻辑（X / Z）和精细时序语义的支持有限，不能代替门级时序分析',
    validation: '与商用仿真器或 FPGA 原型交叉验证；用测试覆盖率评估验证是否充分',
    sources: [{ label: 'Verilator 官方网站', url: 'https://www.veripool.org/verilator/' }],
    verification: 'none',
  },
  firesim: {
    name: 'FireSim',
    use: '需要跑完整软件栈的 SoC 研究，以及多节点数据中心规模的模拟',
    capabilities:
      '从 ASIC RTL 生成周期精确的模型，在 FPGA（如 AWS EC2 F1）上运行；可以模拟一到数千个多核节点，并模拟节点之间的网络',
    limitations:
      '需要已有的 RTL 设计（通常来自 Rocket Chip 等开源生态）；FPGA 资源和云上费用较高，编译耗时长',
    validation: '相对 RTL 是周期精确的，但 RTL 代表的设计不等于商用芯片，结论仍要说明设计假设',
    sources: [
      {
        label: 'Karandikar 等，FireSim，ISCA 2018',
        url: 'https://bar.eecs.berkeley.edu/projects/firesim.html',
      },
    ],
    verification: 'ok',
  },
  perf: {
    name: 'perf / Nsight',
    use: '真机上的瓶颈定位，以及为模拟器、模型提供校准数据',
    capabilities:
      '读取 CPU 和 GPU 的硬件性能计数器：指令数、缓存缺失、访存带宽、warp 停顿原因等；Nsight Systems 还能画出 CPU、GPU、通信的时间线',
    limitations:
      '只能观测已经存在的硬件，无法评估尚未实现的设计；计数器的定义随硬件代际变化，跨平台比较要谨慎；采样本身有开销',
    validation: '多次运行取统计值；用微基准确认每个计数器的真实含义',
    sources: [
      { label: 'Linux perf wiki', url: 'https://perf.wiki.kernel.org/' },
      { label: 'NVIDIA Nsight Compute 文档', url: 'https://docs.nvidia.com/nsight-compute/' },
    ],
    verification: 'none',
  },
  mcpat: {
    name: 'McPAT',
    use: '为性能模拟结果补上功耗和面积估计',
    capabilities:
      '估算处理器核、缓存等结构的动态功耗、泄漏功耗和面积，常与 gem5 等性能模拟器配合使用',
    limitations:
      'Xi 等人用工业级功耗工具链评估后指出，McPAT 的模型可能不完整或过于抽象，误差可能很大；用于电压噪声、热点这类研究时尤其明显',
    validation: '只比较相对趋势；对关键结构用 RTL 综合结果校准；参照该论文给出的建议修正模型',
    sources: [
      {
        label: 'Xi 等，Quantifying Sources of Error in McPAT，HPCA 2015',
        url: 'https://vlsiarch.eecs.harvard.edu/publications/quantifying-sources-error-mcpat-and-potential-impacts-architectural-studies',
      },
    ],
    verification: 'ok',
  },
  yosys: {
    name: 'Yosys',
    use: '把 RTL 综合成门级网表；开源数字设计流程的前端',
    capabilities:
      '读入 Verilog，做逻辑优化和工艺映射，输出网表与面积统计；可以编写综合脚本，并调用 ABC 做逻辑优化',
    limitations:
      '对 SystemVerilog 的支持不完整；综合质量和商用工具有差距，结论不宜直接外推到商用流程',
    validation: '与商用工具在同一设计上对比面积和时序；用等价性检查确认综合前后功能一致',
    sources: [{ label: 'Yosys 官方网站', url: 'https://yosyshq.net/yosys/' }],
    verification: 'none',
  },
  abc: {
    name: 'ABC',
    use: '逻辑综合算法与形式化验证研究的实验平台',
    capabilities:
      '基于与非图（AIG）表示，提供逻辑优化、工艺映射、等价性检查和时序电路验证等算法，可以作为库嵌入其他工具',
    limitations: '偏重算法研究，单独使用时缺少完整的前后端流程；命令和脚本对新手不够友好',
    validation: '在 EPFL、IWLS 等公开基准电路上与已发表结果比较；用等价性检查保证优化正确',
    sources: [{ label: 'ABC 项目主页', url: 'https://people.eecs.berkeley.edu/~alanmi/abc/' }],
    verification: 'none',
  },
  openroad: {
    name: 'OpenROAD',
    use: '开源的 RTL 到版图（GDSII）全流程，研究布局、布线和时序收敛',
    capabilities:
      '集成布局规划、布局、时钟树综合、布线和静态时序分析；配套的 OpenROAD-flow-scripts 支持多种开源工艺库',
    limitations:
      '开源工艺库与先进商用工艺差别大；结果质量与商用流程有差距，在先进节点上的结论需谨慎',
    validation: '在相同设计和工艺上与商用工具对比；报告是否满足时序和 DRC 检查',
    sources: [
      { label: 'OpenROAD 项目', url: 'https://theopenroadproject.org/' },
      { label: 'OpenROAD 文档', url: 'https://openroad.readthedocs.io/' },
    ],
    verification: 'none',
  },
  qemu: {
    name: 'QEMU',
    use: '在虚拟机里调试内核、做操作系统和虚拟化实验',
    capabilities:
      '模拟多种 CPU 架构，可以单独作为模拟器运行，也可以配合 KVM 做硬件加速虚拟化；支持 GDB 远程调试内核',
    limitations:
      '纯模拟模式下的时序与真机完全不同，不能用来测性能；部分设备模型与真实硬件行为有差异',
    validation: '功能在 QEMU 里调通后，性能实验放到真机上做',
    sources: [{ label: 'QEMU 官方网站', url: 'https://www.qemu.org/' }],
    verification: 'none',
  },
  ebpf: {
    name: 'eBPF / bpftrace',
    use: '在不改内核的前提下测量和追踪内核行为',
    capabilities:
      '把经过验证器检查的小程序挂到内核的追踪点、kprobe、网络钩子上，统计延迟分布、调用次数等；bpftrace 提供类似 awk 的一行式脚本',
    limitations:
      '程序受验证器限制（循环、栈大小等）；探针本身有开销，高频事件上会影响结果；不同内核版本的可用钩子不同',
    validation: '开关探针对比基线性能，确认测量开销可以忽略',
    sources: [
      { label: 'bpftrace', url: 'https://github.com/bpftrace/bpftrace' },
      { label: 'eBPF 官方介绍', url: 'https://ebpf.io/' },
    ],
    verification: 'none',
  },
  syzkaller: {
    name: 'syzkaller',
    use: '内核模糊测试，发现内核漏洞和崩溃',
    capabilities:
      '根据系统调用描述自动生成调用序列，利用覆盖率反馈引导测试，配合 KASAN 等检测器定位内存错误，并尝试生成复现程序',
    limitations:
      '需要为目标接口编写系统调用描述；找到的崩溃需要人工分析，不能把每个崩溃都当成可利用的漏洞',
    validation: '用生成的复现程序确认问题；修复后回归测试',
    sources: [{ label: 'syzkaller', url: 'https://github.com/google/syzkaller' }],
    verification: 'none',
  },
  xv6: {
    name: 'xv6',
    use: '学习和修改一个完整但很小的操作系统内核',
    capabilities:
      'MIT 用于教学的类 Unix 内核（RISC-V 版本），代码量小，能完整读懂进程、页表、文件系统和锁',
    limitations: '为教学而简化，很多机制（调度、内存管理）与 Linux 差别很大，不适合做性能研究',
    validation: '课程实验自带测试；在 xv6 上验证想法后，再到 Linux 上实现和测量',
    sources: [{ label: 'MIT 6.1810 课程（xv6）', url: 'https://pdos.csail.mit.edu/6.1810/' }],
    verification: 'none',
  },
  kvm: {
    name: 'KVM',
    use: '研究硬件辅助虚拟化、虚拟机性能与隔离',
    capabilities:
      'Linux 内核中的虚拟化模块，利用 CPU 的硬件虚拟化扩展运行虚拟机，通常与 QEMU 配合提供设备模拟',
    limitations: '嵌套虚拟化、设备直通等场景的性能受硬件和配置影响很大，实验要写清配置',
    validation: '与裸机对比开销；固定 CPU 绑定和频率以减少噪声',
    sources: [{ label: 'KVM 项目', url: 'https://linux-kvm.org/' }],
    verification: 'none',
  },
  firecracker: {
    name: 'Firecracker',
    use: '轻量虚拟机与 Serverless 研究',
    capabilities:
      '基于 KVM 的微虚拟机监控器，只保留极少的设备模型，启动快、内存开销小，AWS Lambda 等服务使用它',
    limitations: '有意不支持很多通用设备和功能，不适合当作通用虚拟机平台评估',
    validation: '测量冷启动时间和内存占用时，与容器、传统虚拟机在相同函数上对比',
    sources: [{ label: 'Firecracker 项目', url: 'https://firecracker-microvm.github.io/' }],
    verification: 'none',
  },
  k8s: {
    name: 'Kubernetes',
    use: '容器编排、调度策略和自动伸缩研究',
    capabilities:
      '管理容器化应用的部署、调度、伸缩和故障恢复；调度器可以扩展，方便实现新的调度策略',
    limitations: '真实集群的规模和干扰很难在实验室复现；配置项多，结果对配置敏感',
    validation: '用公开 trace 回放负载；在小集群上实测，再用模拟推演大规模',
    sources: [{ label: 'Kubernetes 官网', url: 'https://kubernetes.io/' }],
    verification: 'none',
  },
  cloudlab: {
    name: 'CloudLab',
    use: '需要裸机、可完全控制硬件的系统与网络实验',
    capabilities:
      '面向研究者的测试床，可以按需申请裸机服务器并自定义网络拓扑，实验环境可以用配置文件复现',
    limitations: '可用的硬件型号和数量有限；热门机型需要排队预约',
    validation: '在论文中公开实验配置文件，方便他人复现',
    sources: [{ label: 'CloudLab', url: 'https://www.cloudlab.us/' }],
    verification: 'none',
  },
  traces: {
    name: '公开集群 trace',
    use: '调度、资源管理、Serverless 研究的负载来源',
    capabilities:
      'Google、Azure 等公开了生产集群的作业、资源使用或函数调用记录，可以用来分析负载特征或回放到模拟器中',
    limitations: '数据经过脱敏和采样，缺少应用语义；只代表发布方某一时期的负载',
    validation: '同时在多份 trace 上验证结论，避免只对某一份数据过拟合',
    sources: [
      { label: 'Google cluster data', url: 'https://github.com/google/cluster-data' },
      { label: 'Azure Public Dataset', url: 'https://github.com/Azure/AzurePublicDataset' },
    ],
    verification: 'none',
  },
  llvm: {
    name: 'LLVM',
    use: '编译优化、代码生成、程序分析研究的主力平台',
    capabilities:
      '提供统一的 SSA 中间表示和大量优化 pass，可以编写自己的 pass 并插入优化流水线，支持多种目标架构',
    limitations: '代码库庞大、版本更新快，研究原型容易跟不上上游；优化收益常常依赖具体目标和基准',
    validation: '在 SPEC、PolyBench 等基准上报告效果；用测试套件确认没有破坏正确性',
    sources: [{ label: 'LLVM 项目', url: 'https://llvm.org/' }],
    verification: 'none',
  },
  mlir: {
    name: 'MLIR',
    use: '领域专用编译器、多层中间表示设计',
    capabilities:
      '可以自定义方言（dialect），在不同抽象层次之间逐步降级，复用通用的优化和转换基础设施',
    limitations: '概念多、学习曲线陡；各方言成熟度不一',
    validation: '与手写实现或厂商库对比性能；用方言自带的测试检查转换正确性',
    sources: [{ label: 'MLIR 官网', url: 'https://mlir.llvm.org/' }],
    verification: 'none',
  },
  tvm: {
    name: 'Apache TVM',
    use: '深度学习编译、算子调度与自动调优',
    capabilities: '把模型从各框架导入，做图级优化，并为 CPU、GPU 和加速器生成和自动调优算子代码',
    limitations: '自动调优耗时长；对最新模型结构和硬件的支持可能滞后于厂商库',
    validation: '与 cuDNN、厂商推理引擎对比端到端延迟',
    sources: [{ label: 'Apache TVM', url: 'https://tvm.apache.org/' }],
    verification: 'none',
  },
  triton: {
    name: 'Triton',
    use: '用 Python 编写高性能 GPU kernel',
    capabilities:
      '以分块（block）为单位编程，由编译器处理线程映射、共享内存和访存合并，适合快速写出接近手写 CUDA 性能的算子',
    limitations: '对极致优化（如使用最新硬件特性）的控制不如直接写 CUDA；不同硬件后端成熟度不同',
    validation: '与 cuBLAS、cuDNN 或手写 kernel 对比吞吐，并检查数值误差',
    sources: [{ label: 'Triton', url: 'https://github.com/triton-lang/triton' }],
    verification: 'none',
  },
  godbolt: {
    name: 'Compiler Explorer',
    use: '快速查看编译器在不同选项下生成的汇编',
    capabilities: '在线比较多种编译器、多种版本、多种优化级别输出的汇编和中间表示',
    limitations: '只适合观察小段代码，不能代替完整程序的性能测量',
    validation: '观察到的优化现象，再在完整程序上测量确认',
    sources: [{ label: 'Compiler Explorer', url: 'https://godbolt.org/' }],
    verification: 'none',
  },
  tla: {
    name: 'TLA+',
    use: '在实现之前验证分布式协议的设计',
    capabilities:
      '用数学方式写出协议规约，再用 TLC 模型检验器穷举小规模下的所有交错执行，找出违反安全性或活性的反例',
    limitations:
      '验证的是模型而不是代码，模型和实现之间仍可能不一致；状态空间随规模爆炸，只能检验小规模配置',
    validation: '把模型检验找到的反例转成对实现的测试用例',
    sources: [
      { label: 'TLA+ 主页（Lamport）', url: 'https://lamport.azurewebsites.net/tla/tla.html' },
    ],
    verification: 'none',
  },
  jepsen: {
    name: 'Jepsen',
    use: '检验真实分布式数据库和协调服务在故障下是否满足其一致性承诺',
    capabilities:
      '在集群上注入网络分区、节点崩溃、时钟偏移等故障，记录客户端操作历史，再检查历史是否满足线性一致等模型',
    limitations: '只能发现被触发到的问题，不能证明没有问题；搭建需要一定的工程量',
    validation: '报告故障类型、触发频率和最小复现步骤',
    sources: [{ label: 'Jepsen', url: 'https://jepsen.io/' }],
    verification: 'none',
  },
  mpi: {
    name: 'MPI（Open MPI / MPICH）',
    use: '分布式内存并行程序设计与通信研究',
    capabilities:
      '提供点对点通信、集合通信、单边通信等标准接口，有多种成熟实现，是超算上并行程序的事实标准',
    limitations: '性能高度依赖实现、网络硬件和参数配置；同一个程序换平台可能表现不同',
    validation: '用 OSU 等微基准测通信性能；报告强扩展和弱扩展曲线',
    sources: [
      { label: 'MPI Forum 标准', url: 'https://www.mpi-forum.org/docs/' },
      { label: 'Open MPI', url: 'https://www.open-mpi.org/' },
      { label: 'MPICH', url: 'https://www.mpich.org/' },
    ],
    verification: 'none',
  },
  hpctoolkit: {
    name: 'HPCToolkit',
    use: '大规模并行程序的性能分析',
    capabilities:
      '通过采样收集调用路径级别的性能数据，开销较低，支持 MPI、OpenMP 和 GPU 程序，可以把性能问题定位到源代码行',
    limitations: '采样有统计误差；大规模运行产生的数据量大，分析需要时间',
    validation: '在已知瓶颈的程序上确认工具能定位到正确位置',
    sources: [{ label: 'HPCToolkit', url: 'https://hpctoolkit.org/' }],
    verification: 'none',
  },
  simgrid: {
    name: 'SimGrid',
    use: '模拟大规模分布式和并行应用，研究调度与通信算法',
    capabilities:
      '用较粗粒度的模型模拟网络和计算，可以在一台机器上模拟成千上万个节点的 MPI 应用或分布式算法',
    limitations: '模型抽象层次高，细粒度的微架构和网络硬件行为不在模型内；结果精度取决于平台描述',
    validation: '用真机的小规模测量结果校准平台模型',
    sources: [{ label: 'SimGrid', url: 'https://simgrid.org/' }],
    verification: 'none',
  },
  fio: {
    name: 'fio',
    use: '块设备和文件系统的 I/O 微基准测试',
    capabilities: '精确控制读写模式、块大小、队列深度和并发度，报告吞吐、IOPS 和延迟分位数',
    limitations: '合成负载不能代表真实应用；SSD 结果受预处理（是否写满）和温度影响很大',
    validation: '测试前对 SSD 做预处理，进入稳态后再测；报告尾延迟而不只是平均值',
    sources: [{ label: 'fio', url: 'https://github.com/axboe/fio' }],
    verification: 'none',
  },
  ycsb: {
    name: 'YCSB',
    use: '键值存储和数据库的标准负载',
    capabilities:
      '提供几种标准负载（读多写少、写多等），可以设置请求分布（如 Zipf），对多种存储系统运行同一套负载',
    limitations: '负载模型较简单，不包含复杂事务和查询',
    validation: '使用标准负载编号，方便与其他论文对比',
    sources: [{ label: 'YCSB', url: 'https://github.com/brianfrankcooper/YCSB' }],
    verification: 'none',
  },
  femu: {
    name: 'FEMU',
    use: '研究尚未上市或无法修改固件的 SSD 设计',
    capabilities:
      '基于 QEMU 的 SSD 模拟器，可以在虚拟机中模拟闪存 SSD，支持修改 FTL 和开放通道、ZNS 等接口',
    limitations: '闪存的时序和错误行为经过简化；宿主机性能会影响模拟结果',
    validation: '与真实 SSD 在相同负载下对比延迟特征',
    sources: [{ label: 'FEMU', url: 'https://github.com/MoatLab/FEMU' }],
    verification: 'none',
  },
  rocksdb: {
    name: 'RocksDB / db_bench',
    use: 'LSM-tree 键值存储的研究与改造',
    capabilities:
      '工业级 LSM-tree 引擎，参数可调；自带 db_bench 基准，可以观察写放大、压缩（compaction）开销等',
    limitations: '参数非常多，默认参数下的结论未必有代表性',
    validation: '公开全部参数配置；同时报告吞吐和写放大',
    sources: [{ label: 'RocksDB', url: 'https://rocksdb.org/' }],
    verification: 'none',
  },
  ns3: {
    name: 'ns-3',
    use: '网络协议与拥塞控制的大规模模拟',
    capabilities: '离散事件网络模拟器，内置多种协议模型，可以模拟数据中心拓扑和大量流',
    limitations: '模型与真实硬件（交换机缓冲、网卡行为）存在差距；大规模模拟耗时长',
    validation: '关键结论在测试床或真实部署上复核',
    sources: [{ label: 'ns-3', url: 'https://www.nsnam.org/' }],
    verification: 'none',
  },
  mininet: {
    name: 'Mininet',
    use: '在一台机器上搭建虚拟网络，测试真实的协议栈和 SDN 程序',
    capabilities: '用轻量级虚拟化创建主机、交换机和链路，运行真实的 Linux 网络栈和应用',
    limitations: '所有节点共享一台机器的 CPU，带宽和延迟不真实，不适合做性能评估',
    validation: '功能验证在 Mininet 上做，性能评估放到真实硬件上',
    sources: [{ label: 'Mininet', url: 'http://mininet.org/' }],
    verification: 'none',
  },
  p4: {
    name: 'P4 / BMv2',
    use: '可编程数据平面与在网计算研究',
    capabilities:
      '用 P4 语言描述交换机如何解析和处理数据包；BMv2 是软件参考交换机，便于调试，也可以编译到可编程交换芯片上',
    limitations: '软件交换机性能远低于硬件；硬件目标对程序有资源和语义限制',
    validation: '在软件交换机上验证功能，在硬件交换机上测线速性能',
    sources: [{ label: 'P4 官网', url: 'https://p4.org/' }],
    verification: 'none',
  },
  dpdk: {
    name: 'DPDK',
    use: '内核旁路的高性能数据包处理',
    capabilities: '在用户态直接轮询网卡收发包，绕过内核网络栈，达到很高的包处理速率',
    limitations: '轮询独占 CPU 核；需要特定网卡驱动支持；开发难度高于普通套接字编程',
    validation: '用线速包生成器测吞吐和延迟，并报告占用的 CPU 核数',
    sources: [{ label: 'DPDK', url: 'https://www.dpdk.org/' }],
    verification: 'none',
  },
  nccltests: {
    name: 'NCCL Tests',
    use: '测量 GPU 集合通信的带宽',
    capabilities: '对 all-reduce、all-gather 等集合操作在不同消息大小下测量算法带宽和总线带宽',
    limitations: '只测通信本身，不包含计算重叠和真实训练中的干扰',
    validation: '与理论带宽对比，检查拓扑与配置是否正确',
    sources: [{ label: 'nccl-tests', url: 'https://github.com/NVIDIA/nccl-tests' }],
    verification: 'none',
  },
  aflpp: {
    name: 'AFL++',
    use: '用户态程序的覆盖率引导模糊测试',
    capabilities:
      '在 AFL 基础上整合了多项学术改进，支持多种插桩方式和变异策略，可以测试源码或二进制程序',
    limitations: '难以穿过复杂校验和格式约束；找到的崩溃需要人工分析和去重',
    validation: '与其他模糊测试器在 FuzzBench 等统一平台上比较，多次重复取统计值',
    sources: [
      { label: 'AFL++', url: 'https://aflplus.plus/' },
      {
        label: 'Fioraldi 等，AFL++，WOOT 2020',
        url: 'https://www.usenix.org/conference/woot20/presentation/fioraldi',
      },
    ],
    verification: 'none',
  },
  sanitizers: {
    name: 'Sanitizers（ASan 等）',
    use: '在运行时发现内存错误和未定义行为',
    capabilities:
      '编译时插桩，运行时检测越界访问、释放后使用、数据竞争（TSan）、未定义行为（UBSan）等',
    limitations: '有明显的运行开销；只能发现实际执行到的错误',
    validation: '常与模糊测试配合使用，把隐蔽的内存错误变成可见的崩溃',
    sources: [{ label: 'google/sanitizers', url: 'https://github.com/google/sanitizers' }],
    verification: 'none',
  },
  crashmonkey: {
    name: 'CrashMonkey / ACE',
    use: '系统化地测试文件系统的崩溃一致性',
    capabilities:
      '记录文件系统操作产生的块 I/O，在不同位置模拟崩溃并检查恢复后的状态；ACE 自动生成有界的操作序列',
    limitations: '只覆盖有界长度的操作序列；需要为不同文件系统定义正确性检查',
    validation: '把发现的问题提交给文件系统开发者确认',
    sources: [{ label: 'CrashMonkey', url: 'https://github.com/utsaslab/crashmonkey' }],
    verification: 'none',
  },
  alice: {
    name: 'ALICE',
    use: '检查应用程序在文件系统崩溃后能否正确恢复',
    capabilities:
      '记录应用的系统调用，枚举各种合法的持久化顺序，构造崩溃后的磁盘状态并运行应用的恢复检查',
    limitations: '需要为每个应用编写一致性检查；依赖对文件系统行为的抽象模型',
    validation: '把找到的漏洞向应用开发者报告确认',
    sources: [
      {
        label: 'ALICE（Wisconsin ADSL）',
        url: 'https://research.cs.wisc.edu/adsl/Software/alice/',
      },
    ],
    verification: 'none',
  },
  rapl: {
    name: 'RAPL / powercap',
    use: '测量 CPU 封装和内存的能耗',
    capabilities: '通过处理器提供的能量计数器读取能耗，Linux 下可以经由 powercap 接口或 perf 读取',
    limitations: '只覆盖处理器和内存等部分组件，不包括整机；计数器分辨率和准确性因代际而异',
    validation: '用外接功率计测量整机功耗作对照',
    sources: [
      {
        label: 'Linux powercap 文档',
        url: 'https://www.kernel.org/doc/html/latest/power/powercap/powercap.html',
      },
    ],
    verification: 'none',
  },
  nvml: {
    name: 'NVML / nvidia-smi',
    use: '测量 GPU 功耗、频率和温度',
    capabilities: '读取 GPU 的功耗、显存使用、频率、温度等，可以设置功耗上限和频率',
    limitations: '功耗读数是周期性采样，可能是平滑后的值，短时间的功耗尖峰测不准',
    validation: '拉长测量时间、取多次平均；必要时用外部功率计对照',
    sources: [
      { label: 'NVIDIA NVML', url: 'https://developer.nvidia.com/management-library-nvml' },
    ],
    verification: 'none',
  },
  torchprof: {
    name: 'PyTorch Profiler',
    use: '分析训练和推理中各算子的耗时与显存',
    capabilities: '记录 CPU 与 GPU 上的算子执行时间、显存分配和调用栈，可以导出时间线查看',
    limitations: '开启分析会带来额外开销；只看到框架层面的视图，底层 kernel 细节需配合 Nsight',
    validation: '只在稳定的若干迭代上采样，排除预热阶段',
    sources: [
      { label: 'PyTorch Profiler 文档', url: 'https://pytorch.org/docs/stable/profiler.html' },
    ],
    verification: 'none',
  },
  vllm: {
    name: 'vLLM',
    use: '大模型推理服务的研究基线和实验平台',
    capabilities:
      '基于 PagedAttention 管理 KV Cache，支持连续批处理、多种并行方式，自带吞吐和延迟基准脚本',
    limitations: '版本迭代很快，不同版本的性能差异大，论文中必须写明版本号',
    validation: '固定版本和参数；同时报告吞吐、首 token 延迟和每 token 延迟',
    sources: [{ label: 'vLLM', url: 'https://github.com/vllm-project/vllm' }],
    verification: 'none',
  },
  sglang: {
    name: 'SGLang',
    use: '大模型推理服务与结构化生成研究',
    capabilities:
      '推理服务框架，支持前缀缓存复用（RadixAttention）等优化，适合多轮对话和复杂生成程序',
    limitations: '版本迭代快；与 vLLM 等对比时要注意配置是否等价',
    validation: '在相同模型、相同硬件和相同请求分布下对比',
    sources: [{ label: 'SGLang', url: 'https://github.com/sgl-project/sglang' }],
    verification: 'none',
  },
  megatron: {
    name: 'Megatron-LM / DeepSpeed',
    use: '大模型分布式训练',
    capabilities:
      'Megatron-LM 提供张量并行和流水线并行；DeepSpeed 提供 ZeRO 系列显存优化；两者常组合使用',
    limitations: '需要多卡甚至多机环境；配置组合多，性能对并行策略非常敏感',
    validation: '报告模型浮点利用率（MFU）和扩展效率',
    sources: [
      { label: 'Megatron-LM', url: 'https://github.com/NVIDIA/Megatron-LM' },
      { label: 'DeepSpeed', url: 'https://www.deepspeed.ai/' },
    ],
    verification: 'none',
  },
  duckdb: {
    name: 'DuckDB',
    use: '分析型查询执行与向量化引擎研究',
    capabilities:
      '嵌入式列式分析数据库，采用向量化执行，单个文件即可运行，方便查看查询计划和修改源码',
    limitations: '定位单机分析，不适合研究事务处理和分布式场景',
    validation: '在 TPC-H 等基准上与其他引擎对比',
    sources: [{ label: 'DuckDB', url: 'https://duckdb.org/' }],
    verification: 'none',
  },
  postgres: {
    name: 'PostgreSQL',
    use: '查询优化器、事务与存储研究的通用平台',
    capabilities:
      '功能完整的开源关系数据库，支持扩展机制，EXPLAIN ANALYZE 可以查看计划和实际执行代价',
    limitations: '架构较传统，部分新技术（如向量化执行）需要大量改造',
    validation: '使用标准基准并公开配置参数',
    sources: [{ label: 'PostgreSQL', url: 'https://www.postgresql.org/' }],
    verification: 'none',
  },
  tpc: {
    name: 'TPC 基准',
    use: '数据库系统性能评估的标准负载',
    capabilities: 'TPC-C 代表在线事务处理，TPC-H、TPC-DS 代表分析型查询，规定了数据生成和查询集合',
    limitations: '负载是合成的，与具体业务有差距；正式公布成绩有严格规则，研究中通常只是借用负载',
    validation: '说明数据规模因子和是否遵循官方规则',
    sources: [{ label: 'TPC 官网', url: 'https://www.tpc.org/' }],
    verification: 'none',
  },
  zephyr: {
    name: 'Zephyr RTOS',
    use: '嵌入式与实时操作系统研究',
    capabilities: '开源实时操作系统，支持大量开发板和 MCU，提供调度器、驱动和网络协议栈',
    limitations: '不同开发板的支持程度不一；实时性分析仍需针对具体硬件',
    validation: '在目标开发板上测量中断延迟和任务响应时间',
    sources: [{ label: 'Zephyr Project', url: 'https://www.zephyrproject.org/' }],
    verification: 'none',
  },
  tflm: {
    name: 'TensorFlow Lite Micro',
    use: '在微控制器上部署神经网络',
    capabilities: '面向只有几十到几百 KB 内存的设备，提供不依赖操作系统的推理运行时和量化模型支持',
    limitations: '支持的算子有限；性能依赖针对具体芯片优化的 kernel 库',
    validation: '在真实 MCU 上测量延迟、峰值内存和能耗',
    sources: [{ label: 'tflite-micro', url: 'https://github.com/tensorflow/tflite-micro' }],
    verification: 'none',
  },
  qiskit: {
    name: 'Qiskit',
    use: '量子电路编程、编译与模拟',
    capabilities:
      '编写量子电路，编译（transpile）到具体硬件的门集合和连接拓扑上，可在模拟器中运行或提交到云端量子计算机',
    limitations: '经典模拟器能模拟的量子比特数很有限；真机噪声大，结果需要统计处理',
    validation: '同一电路在模拟器和真机上对比，量化噪声影响',
    sources: [{ label: 'Qiskit', url: 'https://github.com/Qiskit/qiskit' }],
    verification: 'none',
  },
};
