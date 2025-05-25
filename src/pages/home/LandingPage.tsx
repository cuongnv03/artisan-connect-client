import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import {
  StarIcon,
  HandRaisedIcon,
  GlobeAsiaAustraliaIcon,
  ShoppingBagIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

export const LandingPage: React.FC = () => {
  const { state } = useAuth();

  if (state.isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const features = [
    {
      icon: HandRaisedIcon,
      title: 'Nghệ nhân tài hoa',
      description:
        'Kết nối với những nghệ nhân giỏi nhất từ khắp Việt Nam, mỗi người mang trong mình câu chuyện và kỹ năng độc đáo.',
    },
    {
      icon: StarIcon,
      title: 'Sản phẩm chất lượng',
      description:
        'Mọi sản phẩm đều được tuyển chọn kỹ lưỡng, đảm bảo chất lượng cao và mang đậm dấu ấn văn hóa Việt Nam.',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Tương tác trực tiếp',
      description:
        'Trò chuyện, tư vấn và đặt hàng trực tiếp với nghệ nhân. Hiểu rõ câu chuyện đằng sau mỗi tác phẩm.',
    },
    {
      icon: GlobeAsiaAustraliaIcon,
      title: 'Văn hóa truyền thống',
      description:
        'Khám phá và bảo tồn những nghề thủ công truyền thống của Việt Nam qua từng sản phẩm.',
    },
    {
      icon: ShoppingBagIcon,
      title: 'Mua sắm dễ dàng',
      description:
        'Trải nghiệm mua sắm thuận tiện với hệ thống thanh toán an toàn và giao hàng tận nơi.',
    },
    {
      icon: HeartIcon,
      title: 'Cộng đồng yêu thương',
      description:
        'Tham gia cộng đồng những người yêu thích và ủng hộ nghề thủ công Việt Nam.',
    },
  ];

  const testimonials = [
    {
      name: 'Chị Nguyễn Thị Mai',
      role: 'Nghệ nhân gốm sứ Bát Tràng',
      content:
        'Artisan Connect đã giúp tôi kết nối với khách hàng trên khắp cả nước. Giờ đây, những chiếc bình gốm của tôi không chỉ ở trong làng mà còn đến với mọi người.',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face',
    },
    {
      name: 'Anh Trần Văn Minh',
      role: 'Khách hàng thường xuyên',
      content:
        'Tôi rất thích được trò chuyện trực tiếp với các nghệ nhân. Mỗi sản phẩm đều có câu chuyện riêng, điều này làm chúng trở nên đặc biệt hơn nhiều.',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
    },
    {
      name: 'Chị Phạm Thị Lan',
      role: 'Nghệ nhân thêu tay',
      content:
        'Nền tảng này thật tuyệt vời! Tôi có thể chia sẻ quy trình làm việc và nhận được nhiều đơn hàng từ những khách hàng yêu thích nghề thêu truyền thống.',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-vietnamese text-white overflow-hidden">
        <div className="absolute inset-0 pattern-traditional opacity-10"></div>
        <div className="relative container-responsive py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
                Kết nối
                <span className="block text-gold-300">Nghệ nhân Việt</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-gray-100 leading-relaxed">
                Khám phá thế giới thủ công mỹ nghệ Việt Nam qua những câu chuyện
                và tác phẩm của các nghệ nhân tài hoa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/auth/register">
                  <Button
                    variant="white"
                    size="lg"
                    className="  shadow-lg font-semibold"
                  >
                    Bắt đầu ngay
                  </Button>
                </Link>
                <Link to="/auth/login">
                  <Button
                    variant="whiteOutline"
                    size="lg"
                    className="border-2 font-semibold"
                  >
                    Đăng nhập
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img
                    className="rounded-lg shadow-lg transform rotate-3 hover:rotate-6 transition-transform"
                    src="https://media.istockphoto.com/id/639487044/photo/hands-of-a-potter-creating-an-earthen-jar.webp?a=1&b=1&s=612x612&w=0&k=20&c=QnEwIt2GyTFvMlG5TFt7KSyMcHBqNhjcf4Lcsn7juEg="
                    alt="Nghệ nhân làm gốm"
                  />
                  <img
                    className="rounded-lg shadow-lg transform -rotate-2 hover:-rotate-6 transition-transform"
                    src="https://images.unsplash.com/photo-1632224238847-33625482f0c1?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Sản phẩm thủ công"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <img
                    className="rounded-lg shadow-lg transform -rotate-3 hover:-rotate-6 transition-transform"
                    src="https://images.unsplash.com/photo-1734873741744-759ea0a3b3e5?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Nghề thêu truyền thống"
                  />
                  <img
                    className="rounded-lg shadow-lg transform rotate-2 hover:rotate-6 transition-transform"
                    src="https://images.unsplash.com/photo-1677146337118-501fbedfe23c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Làng nghề Việt Nam"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn Artisan Connect?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Chúng tôi tạo ra một không gian kết nối đặc biệt giữa nghệ nhân và
              khách hàng, nơi mỗi sản phẩm đều mang một câu chuyện ý nghĩa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-white">
        <div className="container-responsive">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                1000+
              </div>
              <div className="text-gray-600">Nghệ nhân</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                50K+
              </div>
              <div className="text-gray-600">Sản phẩm</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                200K+
              </div>
              <div className="text-gray-600">Khách hàng</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                63
              </div>
              <div className="text-gray-600">Tỉnh thành</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cảm nhận từ cộng đồng
            </h2>
            <p className="text-xl text-gray-600">
              Nghe những chia sẻ từ nghệ nhân và khách hàng của chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card p-6">
                <div className="flex items-center mb-4">
                  <img
                    className="w-12 h-12 rounded-full object-cover"
                    src={testimonial.avatar}
                    alt={testimonial.name}
                  />
                  <div className="ml-3">
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white rounded-xl mx-4 my-6">
        <div className="container-responsive text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Sẵn sàng khám phá?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            Tham gia cộng đồng Artisan Connect ngay hôm nay
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth/register">
              <Button variant="white" size="lg" className="font-semibold">
                Đăng ký miễn phí
              </Button>
            </Link>
            <Link to="/discover">
              <Button
                variant="whiteOutline"
                size="lg"
                className="border-2 font-semibold"
              >
                Khám phá ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
