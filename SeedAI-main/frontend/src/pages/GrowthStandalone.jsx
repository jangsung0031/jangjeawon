import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  Upload,
  Camera,
  Image as ImageIcon,
  X,
  Loader2,
  RefreshCw,
  ArrowRight,
  Info
} from 'lucide-react';
import { identifyPlant, getGrowthInsight, getMonthlyDataAnalysis } from '../api/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// [수정] 파일 이름과 맞추기 위해 GrowthStandalone -> Growth로 변경
export default function Growth() { 
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // 종식별 관련 상태
  const [showIdentify, setShowIdentify] = useState(false);
  const [identifyFile, setIdentifyFile] = useState(null);
  const [identifyPreview, setIdentifyPreview] = useState('');
  const [identifyLoading, setIdentifyLoading] = useState(false);
  const [identifyResult, setIdentifyResult] = useState(null);

  // 성장 데이터 상태
  const [growthData, setGrowthData] = useState(null);
  const [growthLoading, setGrowthLoading] = useState(false);

  // 드래그 앤 드롭 상태
  const [dragActive, setDragActive] = useState(false);

  // 로컬스토리지에서 저장된 종식별 정보 불러오기
  useEffect(() => {
    const savedIdentification = localStorage.getItem('latest-plant-identification');
    if (savedIdentification) {
      try {
        const data = JSON.parse(savedIdentification);
        setIdentifyResult(data);
        setIdentifyPreview(data.uploadedImageUrl);
        setShowIdentify(false);
        
        // 저장된 식별 정보가 있으면 성장 데이터도 로드
        if (data.identification?.plant_name) {
          loadGrowthData(data.identification.plant_name, null);
        }
      } catch (error) {
        console.error('Error loading saved identification:', error);
      }
    } else {
      setShowIdentify(true);
    }
  }, []);

  // 성장 데이터 로드
  const loadGrowthData = async (plantName, imageFile = null) => {
    setGrowthLoading(true);
    try {
      let data = null;
      
      // 1. 먼저 월별 데이터 분석 시도 (저장된 데이터 기반)
      try {
        data = await getMonthlyDataAnalysis(plantName, 12);
      } catch (monthlyError) {
        console.warn('월별 데이터 로드 실패, growth-insight로 fallback:', monthlyError);
        
        // 2. 실패 시 growth-insight 시도 (이미지 기반)
        if (imageFile) {
          try {
            data = await getGrowthInsight({
              file: imageFile,
              species_hint: plantName,
              period_unit: 'month',
              max_periods: 12
            });
          } catch (insightError) {
            console.error('growth-insight도 실패:', insightError);
            throw new Error('성장 데이터를 가져올 수 없습니다.');
          }
        } else {
          throw monthlyError;
        }
      }
      
      if (data && data.growth_graph) {
        // 백엔드 데이터 구조 확인
        let graphData = [];
        let lastOptimalHeight = 0;
        let lastPoorHeight = 0;
        
        // growth_graph가 배열인 경우 (monthly-data-analysis)
        if (Array.isArray(data.growth_graph)) {
          graphData = data.growth_graph.map((item, index) => ({
            month: `${index + 1}개월`,
            optimal: item.good_condition || item.optimal,
            poor: item.bad_condition || item.poor,
            current: item.current || item.height || item.expected_height
          }));
          lastOptimalHeight = data.growth_graph[data.growth_graph.length - 1]?.good_condition || 0;
          lastPoorHeight = data.growth_graph[data.growth_graph.length - 1]?.bad_condition || 0;
        }
        // growth_graph가 객체인 경우 (growth-insight)
        else if (data.growth_graph.good_growth && data.growth_graph.bad_growth) {
          const goodGrowth = data.growth_graph.good_growth;
          const badGrowth = data.growth_graph.bad_growth;
          
          graphData = goodGrowth.map((goodPoint, index) => {
            const badPoint = badGrowth[index];
            return {
              month: goodPoint.period === 0 ? '현재' : `${goodPoint.period}개월`,
              optimal: goodPoint.size,
              poor: badPoint?.size || goodPoint.size,
              current: (goodPoint.size + (badPoint?.size || goodPoint.size)) / 2
            };
          });
          
          lastOptimalHeight = goodGrowth[goodGrowth.length - 1]?.size || 0;
          lastPoorHeight = badGrowth[badGrowth.length - 1]?.size || 0;
        }
        
        const formattedData = {
          plantName: plantName,
          graphData: graphData,
          monthlyData: data.monthly_data || [],
          comprehensiveAnalysis: data.comprehensive_analysis || '',
          lastOptimalHeight: lastOptimalHeight,
          lastPoorHeight: lastPoorHeight,
        };
        
        setGrowthData(formattedData);
      }
    } catch (error) {
      console.error('성장 데이터 로드 오류:', error);
      toast({
        title: '성장 데이터 로드 실패',
        description: '백엔드 서버가 실행 중인지 확인해주세요.',
        variant: 'destructive',
      });
    } finally {
      setGrowthLoading(false);
    }
  };

  // 종식별 - 파일 처리
  const processIdentifyFile = (f) => {
    if (!f) return;
    
    if (!f.type.startsWith('image/')) {
      toast({
        title: '이미지 파일만 업로드 가능합니다',
        description: 'jpg, png 등의 이미지 파일을 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIdentifyFile(f);
    const previewUrl = URL.createObjectURL(f);
    setIdentifyPreview(previewUrl);
    setIdentifyResult(null);
    setGrowthData(null);
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processIdentifyFile(e.dataTransfer.files[0]);
    }
  };

  // 종식별 실행 및 성장 데이터 가져오기
  const handleIdentifySubmit = async () => {
    if (!identifyFile) {
      toast({
        title: '이미지를 선택해주세요',
        variant: 'destructive',
      });
      return;
    }

    setIdentifyLoading(true);

    try {
      // 1단계: 식물 식별
      const identifyData = await identifyPlant(identifyFile);
      
      if (identifyData.success) {
        const savedData = {
          identification: identifyData.identification,
          careGuide: identifyData.care_guide,
          uploadedImageUrl: identifyPreview,
          timestamp: new Date().toISOString(),
        };
        
        localStorage.setItem('latest-plant-identification', JSON.stringify(savedData));
        setIdentifyResult(savedData);
        setShowIdentify(false);

        toast({
          title: '식별 완료!',
          description: `${identifyData.identification.plant_name} 식별 완료`,
        });

        // 2단계: 성장 데이터 가져오기
        await loadGrowthData(identifyData.identification.plant_name, identifyFile);
      } else {
        toast({
          title: '식별 실패',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Identify error:', error);
      toast({
        title: '식별 실패',
        description: '네트워크 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIdentifyLoading(false);
      setGrowthLoading(false);
    }
  };

  // 종식별 이미지 제거
  const handleRemoveIdentifyImage = () => {
    setIdentifyFile(null);
    setIdentifyPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // 종식별 다시 하기
  const handleReIdentify = () => {
    setShowIdentify(true);
    setIdentifyResult(null);
    setIdentifyFile(null);
    setIdentifyPreview('');
    setGrowthData(null);
    localStorage.removeItem('latest-plant-identification');
  };

  // 우리아이로 이동
  const handleGoToMyChild = () => {
    navigate('/mychild');
  };

  return (
    <div className="w-full min-h-[calc(100vh-73px)] bg-emerald-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 헤더 */}
        <motion.header 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-emerald-800 mb-3">🌿 예측해줘</h1>
          <p className="text-lg text-emerald-700">
            식물을 식별하고 12개월 성장 예측을 확인하세요
          </p>
        </motion.header>

        {/* 종식별 결과 표시 */}
        {identifyResult && !showIdentify && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="rounded-2xl shadow-lg border-emerald-200 bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-emerald-800 text-xl">현재 식별된 식물</CardTitle>
                  <Button
                    onClick={handleReIdentify}
                    variant="outline"
                    size="sm"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-500 rounded-lg transition-all"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    다시 식별하기
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  {identifyPreview && (
                    <img
                      src={identifyPreview}
                      alt="식별된 식물"
                      className="w-32 h-32 rounded-xl object-cover shadow-md"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-emerald-800 mb-2">
                      {identifyResult.identification.plant_name}
                    </h3>
                    {identifyResult.identification.scientific_name && (
                      <p className="text-emerald-600 italic">
                        {identifyResult.identification.scientific_name}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* 종식별 UI */}
        {showIdentify && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {!identifyPreview ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* 갤러리에서 선택 */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => processIdentifyFile(e.target.files?.[0])}
                    className="hidden"
                    id="gallery-upload-growth"
                  />
                  <label
                    htmlFor="gallery-upload-growth"
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-emerald-300 rounded-xl hover:bg-emerald-50 cursor-pointer transition-all hover:border-emerald-500 hover:scale-105 bg-white"
                >
                    <ImageIcon className="w-16 h-16 text-emerald-500 mb-3" />
                    <span className="text-lg font-semibold text-emerald-700 mb-1">
                      갤러리에서 선택
                    </span>
                    <span className="text-sm text-emerald-600">
                      저장된 사진 선택
                    </span>
                  </label>

                  {/* 카메라로 촬영 */}
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => processIdentifyFile(e.target.files?.[0])}
                    className="hidden"
                    id="camera-upload-growth"
                  />
                  <label
                    htmlFor="camera-upload-growth"
                    className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-emerald-300 rounded-xl hover:bg-emerald-50 cursor-pointer transition-all hover:border-emerald-500 hover:scale-105 bg-white"
                  >
                    <Camera className="w-16 h-16 text-emerald-500 mb-3" />
                    <span className="text-lg font-semibold text-emerald-700 mb-1">
                      카메라로 촬영
                    </span>
                    <span className="text-sm text-emerald-600">
                      웹캠으로 촬영
                    </span>
                  </label>
                </div>

                {/* 드래그 앤 드롭 안내 */}
                <div
                  className={`p-6 border-2 border-dashed rounded-xl text-center transition-all ${
                    dragActive
                      ? 'border-emerald-500 bg-emerald-100'
                      : 'border-emerald-200 bg-emerald-50'
                  }`}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-2 transition-all ${
                    dragActive ? 'text-emerald-600 scale-110' : 'text-emerald-400'
                  }`} />
                  <p className="text-emerald-700 font-medium">
                    {dragActive ? '이미지를 여기에 놓으세요!' : '또는 이미지를 드래그 & 드롭'}
                  </p>
                  <p className="text-sm text-emerald-600 mt-1">
                    JPG, PNG 등 이미지 파일
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-emerald-700">
                    또는 식물 이름을 직접 입력하세요
                  </p>
                  <Input
                    placeholder="예: 몬스테라, 장미, 선인장"
                    className="rounded-lg border-emerald-200 focus:border-emerald-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        const plantName = e.target.value.trim();
                        const tempData = {
                          identification: {
                            plant_name: plantName,
                            scientific_name: '',
                            confidence: 1.0,
                          },
                          careGuide: null,
                          uploadedImageUrl: '/images/mimg.jpg',
                          timestamp: new Date().toISOString(),
                        };
                        localStorage.setItem('latest-plant-identification', JSON.stringify(tempData));
                        setIdentifyResult(tempData);
                        setIdentifyPreview('/images/mimg.jpg');
                        setShowIdentify(false);
                  toast({
                    title: '식물 등록 완료',
                    description: `${plantName}이(가) 등록되었습니다.`,
                  });
                  // 이름으로 성장 데이터 로드
                  loadGrowthData(plantName, null);
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div
                  className="w-full aspect-video rounded-xl border-2 border-emerald-200 bg-white overflow-hidden"
                  style={{
                    backgroundImage: `url(${identifyPreview})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleRemoveIdentifyImage}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                  >
                    <X className="w-4 h-4 mr-2" />
                    이미지 삭제
                  </Button>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleIdentifySubmit}
                    disabled={identifyLoading || growthLoading}
                    className="px-10 py-6 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {identifyLoading || growthLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {identifyLoading ? '식별 중...' : '성장 데이터 로딩 중...'}
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5 mr-2" />
                        예측 시작
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* 로딩 오버레이 */}
        {(identifyLoading || growthLoading) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-emerald-500 animate-spin" />
                <h3 className="text-xl font-bold text-emerald-800 mb-2">
                  {identifyLoading ? '이미지 분석 중...' : '성장 데이터 로딩 중...'}
                </h3>
                <p className="text-emerald-600">
                  {identifyLoading 
                    ? 'AI가 식물을 식별하고 있습니다. 잠시만 기다려주세요.'
                    : '12개월 성장 예측 데이터를 준비하고 있습니다.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 성장 그래프 (종식별 완료 후에만 표시) */}
        {identifyResult && !showIdentify && growthData && (
          <>
            {/* 성장 예측 차트 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="rounded-2xl shadow-lg border-emerald-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-emerald-800 text-xl">
                    성장 예측
                  </CardTitle>
                  <p className="text-sm text-emerald-600">
                    식물 (분석 종)의 12개월 성장 예측 데이터입니다.
                  </p>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-bold text-gray-700 mb-4">12개월 성장 예측 차트</h3>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={growthData.graphData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="month" 
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                          label={{ value: '현재', position: 'insideLeft', offset: -10 }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          style={{ fontSize: '12px' }}
                          label={{ value: 'cm', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                          domain={['auto', 'auto']}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #d1d5db',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="plainline"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="optimal" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="좋은 조건 성장" 
                          dot={{ fill: '#10b981', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="poor" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          name="나쁜 조건 성장" 
                          dot={{ fill: '#ef4444', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 월별 데이터와 AI 분석 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid md:grid-cols-[1.5fr_1fr] gap-6"
            >
              {/* 월별 데이터 전체 */}
              <Card className="rounded-2xl shadow-lg border-emerald-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-emerald-800 text-xl">
                    월별 데이터 전체
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-emerald-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">기간</th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">일반(cm)</th>
                          <th className="text-center py-3 px-4 font-semibold text-emerald-700">좋음(cm)</th>
                          <th className="text-center py-3 px-4 font-semibold text-red-600">나쁨(cm)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 bg-emerald-50">
                          <td className="py-3 px-4 font-medium">현재</td>
                          <td className="text-center py-3 px-4">
                            {growthData.graphData[0]?.current?.toFixed(1) || '-'} cm
                          </td>
                          <td className="text-center py-3 px-4 text-emerald-700 font-medium">
                            {growthData.graphData[0]?.optimal?.toFixed(1) || '-'} cm
                          </td>
                          <td className="text-center py-3 px-4 text-red-600 font-medium">
                            {growthData.graphData[0]?.poor?.toFixed(1) || '-'} cm
                          </td>
                        </tr>
                        {growthData.graphData.slice(1).map((data, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">{data.month}</td>
                            <td className="text-center py-3 px-4">
                              {data.current?.toFixed(1) || '-'} cm
                            </td>
                            <td className="text-center py-3 px-4 text-emerald-700">
                              {data.optimal?.toFixed(1)} cm
                            </td>
                            <td className="text-center py-3 px-4 text-red-600">
                              {data.poor?.toFixed(1)} cm
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
  S           </Card>

              {/* AI 종합 설명 및 조언 */}
              <Card className="rounded-2xl shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                <CardHeader>
                  <CardTitle className="text-blue-900 text-xl">
                    AI 종합 설명 및 조언
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {growthData.comprehensiveAnalysis ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-gray-800 mb-2">요약</h4>
                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {growthData.comprehensiveAnalysis}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-gray-800 mb-2">관리 팁</h4>
                        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                          <li>발은 건전함을 유지하고 흙이 60~70% 마르면 충분히 관수하세요.</li>
                          <li>배수력 유지(클라이트/마사 혼합)와 통풍 확보가 중요합니다.</li>
                          <li>성장기에는 저농도 액비를 소량·주적으로 사용하세요.</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-800 mb-2">주의할 점</h4>
                        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                          <li>장시간 직사광은 엽소를 유발할 수 있습니다.</li>
                          <li>장기간 과습은 뿌리부패·곰팡이 발생을 유발합니다.</li>
                          <li>급격한 온도 변화와 찬바람 유입을 피하세요.</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      <p>• 대상: 식물 (분석 종) / 추정 상황(K): 22.2 cm / 시작 높이: 9.0 cm</p>
                      <p>• 기간: 12개월 / 단위: month</p>
                      <p>• 좋은 조건 평균: 17.8 cm, 나쁜 조건 평균: 18.2 cm</p>
                      <p>• 전반적으로 식물 (분석 종)은 안정적인 신장세를 보이며 관리 조건에 따라 변치가 발생할 수 있습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* 케어 팁 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="rounded-2xl shadow-lg border-emerald-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-emerald-800 text-xl">
                    {growthData.plantName} 관리 팁
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <h4 className="font-bold text-emerald-800 mb-2">💧 물주기</h4>
                      <p className="text-sm text-emerald-700">
                        흙의 상태를 확인하여 표면이 마르면 충분히 물을 주세요. 
                        과습은 뿌리 썩음의 원인이 되므로 주의하세요.
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <h4 className="font-bold text-emerald-800 mb-2">☀️ 햇빛</h4>
                      <p className="text-sm text-emerald-700">
                        간접광이 잘 드는 곳에 배치하세요. 
                        직사광선은 잎을 태울 수 있으니 피하는 것이 좋습니다.
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <h4 className="font-bold text-emerald-800 mb-2">🌡️ 온도</h4>
                      <p className="text-sm text-emerald-700">
                        18-27°C 사이가 적당합니다. 
                        급격한 온도 변화는 식물에게 스트레스를 줄 수 있습니다.
                      </p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl">
                      <h4 className="font-bold text-emerald-800 mb-2">🌱 비료</h4>
                      <p className="text-sm text-emerald-700">
                        성장기(봄-여름)에는 2주에 한 번, 휴면기(가을-겨울)에는 한 달에 한 번 액체비료를 주세요.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* 우리아이로 이동 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex justify-center"
            >
              <Button
                onClick={handleGoToMyChild}
                className="px-8 py-6 text-lg font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg"
              >
                우리아이에서 관리 계획 세우기
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </>
        )}

        {/* 성장 데이터 로딩 실패 안내 */}
        {identifyResult && !showIdentify && !growthData && !growthLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="rounded-xl shadow-md border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium mb-1">
                      성장 데이터를 불러오지 못했습니다
                    </p>
                    <p className="text-xs text-blue-700">
Backtrace                   백엔드 서버가 실행 중인지 확인하거나, 다시 시도해주세요.
                    </p>
                    <Button
                      onClick={() => loadGrowthData(identifyResult.identification.plant_name, null)}
                      className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      다시 로드
                    </Button>
                  </div>
                </div>
              </CardContent>
Next         </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}